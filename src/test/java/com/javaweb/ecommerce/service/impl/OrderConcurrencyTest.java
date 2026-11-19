package com.javaweb.ecommerce.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import com.javaweb.ecommerce.dto.record.request.CheckoutRequest;
import com.javaweb.ecommerce.entity.Cart;
import com.javaweb.ecommerce.entity.CartItem;
import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.exception.InsufficientStockException;
import com.javaweb.ecommerce.mapper.OrderItemMapperImpl;
import com.javaweb.ecommerce.mapper.OrderMapper;
import com.javaweb.ecommerce.mapper.OrderMapperImpl;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.OrderRepository;
import com.javaweb.ecommerce.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class OrderConcurrencyTest {

    private static final int THREAD_COUNT = 10;

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductRepository productRepository;

    private OrderServiceImpl orderService;
    private UUID productId;

    // Trạng thái tồn kho và @Version trong DB được bảo vệ nguyên tử (Compare-And-Swap)
    private int dbQuantity;
    private int dbVersion;
    private final Object dbLock = new Object();

    private final Map<UUID, Cart> userCarts = new ConcurrentHashMap<>();
    private final List<Order> savedOrders = new CopyOnWriteArrayList<>();

    @BeforeEach
    void setUp() {
        OrderMapper orderMapper = new OrderMapperImpl();
        ReflectionTestUtils.setField(orderMapper, "orderItemMapper", new OrderItemMapperImpl());
        orderService = new OrderServiceImpl(orderRepository, cartRepository, productRepository, orderMapper);

        productId = UUID.randomUUID();
        dbQuantity = 1;
        dbVersion = 0;
        userCarts.clear();
        savedOrders.clear();

        when(cartRepository.findByUser_Id(any(UUID.class)))
                .thenAnswer(inv -> Optional.ofNullable(userCarts.get(inv.getArgument(0))));

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(UUID.randomUUID());
            savedOrders.add(order);
            return order;
        });
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Product snapshotProduct() {
        synchronized (dbLock) {
            return Product.builder()
                    .id(productId)
                    .name("iPhone 15 Pro Max 256GB")
                    .price(new BigDecimal("30000000"))
                    .quantity(dbQuantity)
                    .version(dbVersion)
                    .build();
        }
    }

    private Product atomicOptimisticSave(Product incoming) {
        synchronized (dbLock) {
            if (!Integer.valueOf(dbVersion).equals(incoming.getVersion())) {
                throw new ObjectOptimisticLockingFailureException(Product.class, incoming.getId());
            }
            dbQuantity = incoming.getQuantity();
            dbVersion = dbVersion + 1;
            incoming.setVersion(dbVersion);
            return incoming;
        }
    }

    @Test
    void tenThreadsSimultaneousRead_onlyOneWinsOptimisticLock() throws InterruptedException {
        CountDownLatch allReadBarrier = new CountDownLatch(THREAD_COUNT);

        when(productRepository.findById(productId)).thenAnswer(inv -> {
            Product snapshot = snapshotProduct();
            allReadBarrier.countDown();
            allReadBarrier.await(5, TimeUnit.SECONDS);
            return Optional.of(snapshot);
        });

        when(productRepository.save(any(Product.class)))
                .thenAnswer(inv -> atomicOptimisticSave(inv.getArgument(0)));

        List<User> users = prepareUsersWithCart();

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(THREAD_COUNT);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger optimisticLockFailures = new AtomicInteger(0);

        CheckoutRequest request = new CheckoutRequest(
                "Khach Hang", "0912345678", "123 Le Loi, Q1", PaymentMethod.COD);

        for (int i = 0; i < THREAD_COUNT; i++) {
            final User user = users.get(i);
            executor.submit(() -> {
                try {
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(
                                    user, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
                    readyLatch.countDown();
                    startLatch.await();

                    orderService.checkout(request);
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException ex) {
                    optimisticLockFailures.incrementAndGet();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                } finally {
                    SecurityContextHolder.clearContext();
                    doneLatch.countDown();
                }
            });
        }

        assertTrue(readyLatch.await(5, TimeUnit.SECONDS));
        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdownNow();

        assertEquals(1, successCount.get(), "Chỉ đúng 1 luồng được phép đặt hàng thành công");
        assertEquals(THREAD_COUNT - 1, optimisticLockFailures.get(),
                "9 luồng còn lại phải bị chặn bởi ObjectOptimisticLockingFailureException");
        assertEquals(0, dbQuantity, "Tồn kho cuối cùng phải bằng 0, không bao giờ âm");
        assertEquals(1, dbVersion, "Version của sản phẩm chỉ tăng đúng 1 lần");
        assertEquals(1, savedOrders.size(), "Chỉ có đúng 1 đơn hàng được lưu vào DB");
    }

    @Test
    void tenThreadsConcurrentRace_neverOversellsStock() throws InterruptedException {
        when(productRepository.findById(productId))
                .thenAnswer(inv -> Optional.of(snapshotProduct()));
        when(productRepository.save(any(Product.class)))
                .thenAnswer(inv -> atomicOptimisticSave(inv.getArgument(0)));

        List<User> users = prepareUsersWithCart();

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(THREAD_COUNT);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        CheckoutRequest request = new CheckoutRequest(
                "Khach Hang", "0987654321", "456 Nguyen Hue, Q1", PaymentMethod.BANK_TRANSFER);

        for (int i = 0; i < THREAD_COUNT; i++) {
            final User user = users.get(i);
            executor.submit(() -> {
                try {
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(
                                    user, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
                    readyLatch.countDown();
                    startLatch.await();

                    orderService.checkout(request);
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException | InsufficientStockException ex) {
                    rejectedCount.incrementAndGet();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                } finally {
                    SecurityContextHolder.clearContext();
                    doneLatch.countDown();
                }
            });
        }

        assertTrue(readyLatch.await(5, TimeUnit.SECONDS));
        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdownNow();

        assertEquals(1, successCount.get());
        assertEquals(THREAD_COUNT - 1, rejectedCount.get());
        assertEquals(0, dbQuantity);
        assertEquals(1, savedOrders.size());
    }

    private List<User> prepareUsersWithCart() {
        List<User> users = new ArrayList<>(THREAD_COUNT);
        Product initialRef = snapshotProduct();
        for (int i = 0; i < THREAD_COUNT; i++) {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .email("racer" + i + "@techshop.vn")
                    .role("CUSTOMER")
                    .build();
            Cart cart = Cart.builder()
                    .id(UUID.randomUUID())
                    .user(user)
                    .items(new ArrayList<>())
                    .build();
            cart.addItem(CartItem.builder()
                    .id(UUID.randomUUID())
                    .product(initialRef)
                    .quantity(1)
                    .build());
            userCarts.put(user.getId(), cart);
            users.add(user);
        }
        return users;
    }
}

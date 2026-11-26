package com.javaweb.ecommerce.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.javaweb.ecommerce.dto.record.request.CheckoutRequest;
import com.javaweb.ecommerce.dto.record.response.OrderResponse;
import com.javaweb.ecommerce.entity.Cart;
import com.javaweb.ecommerce.entity.CartItem;
import com.javaweb.ecommerce.entity.Category;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.entity.enums.CategoryStatus;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.entity.enums.ProductStatus;
import com.javaweb.ecommerce.exception.InsufficientStockException;
import com.javaweb.ecommerce.exception.InvalidOrderStateException;
import com.javaweb.ecommerce.mapper.OrderItemMapperImpl;
import com.javaweb.ecommerce.mapper.OrderMapperImpl;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.CategoryRepository;
import com.javaweb.ecommerce.repository.ProductRepository;
import com.javaweb.ecommerce.repository.UserRepository;
import com.javaweb.ecommerce.service.OrderService;

@DataJpaTest(showSql = false, properties = "spring.config.import=")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({OrderServiceImpl.class, OrderMapperImpl.class, OrderItemMapperImpl.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Testcontainers
class OrderPostgresIT {

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private OrderService orderService;
    @Autowired private ProductRepository products;
    @Autowired private CategoryRepository categories;
    @Autowired private UserRepository users;
    @Autowired private CartRepository carts;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactions;

    private final CheckoutRequest checkoutRequest = new CheckoutRequest(
            "Integration Customer", "0912345678", "Test address", PaymentMethod.COD);

    @BeforeEach
    void setUp() {
        transactions = new TransactionTemplate(transactionManager);
        // This datasource always points to the disposable container, never the application's .env.
        jdbc.execute("TRUNCATE TABLE order_item, orders, cart_item, cart, product, category, users CASCADE");
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void checkoutCommitsOrderStockAndCartAndKeepsPurchasePrice() {
        Product product = createProduct(3);
        User user = createCart(product, 2);
        authenticate(user);

        OrderResponse response = orderService.checkout(checkoutRequest);

        assertNotNull(response.id());
        assertEquals(1, stock(product.getId()));
        assertEquals(1, version(product.getId()));
        assertEquals(0, cartItemCount(user.getId()));
        assertEquals(1L, rowCount("orders"));
        assertEquals(1L, rowCount("order_item"));
        assertEquals("PENDING", jdbc.queryForObject(
                "SELECT status FROM orders WHERE id = ?", String.class, response.id()));
        assertEquals(0, new BigDecimal("200000").compareTo(jdbc.queryForObject(
                "SELECT total_amount FROM orders WHERE id = ?", BigDecimal.class, response.id())));

        jdbc.update("UPDATE product SET price = ? WHERE id = ?", new BigDecimal("150000"), product.getId());
        assertEquals(0, new BigDecimal("100000").compareTo(jdbc.queryForObject(
                "SELECT price FROM order_item WHERE order_id = ?", BigDecimal.class, response.id())));
    }

    @Test
    void insufficientStockRollsBackEarlierDeductionsAndPreservesCart() {
        Product available = createProduct(3);
        Product unavailable = createProduct(0);
        User user = createCart(available, 2);
        transactions.executeWithoutResult(status -> {
            Cart cart = carts.findByUser_Id(user.getId()).orElseThrow();
            cart.addItem(CartItem.builder().product(products.findById(unavailable.getId()).orElseThrow())
                    .quantity(1).build());
            carts.save(cart);
        });
        authenticate(user);

        assertThrows(InsufficientStockException.class, () -> transactions.executeWithoutResult(status -> {
            Cart cart = carts.findByUser_Id(user.getId()).orElseThrow();
            // Ensure the available product is deducted before the second item fails.
            cart.getItems().sort(Comparator.comparing(item -> !item.getProduct().getId().equals(available.getId())));
            orderService.checkout(checkoutRequest);
        }));

        assertEquals(3, stock(available.getId()));
        assertEquals(0, version(available.getId()));
        assertEquals(0, stock(unavailable.getId()));
        assertEquals(2, cartItemCount(user.getId()));
        assertEquals(0L, rowCount("orders"));
        assertEquals(0L, rowCount("order_item"));
    }

    @Test
    void databaseFailureRollsBackCheckoutAtFlushOrCommit() {
        Product product = createProduct(3);
        User user = createCart(product, 2);
        authenticate(user);
        CheckoutRequest invalidOrder = new CheckoutRequest("x".repeat(101),
                checkoutRequest.phoneNumber(), checkoutRequest.shippingAddress(), PaymentMethod.COD);

        assertThrows(DataIntegrityViolationException.class, () -> orderService.checkout(invalidOrder));

        assertEquals(3, stock(product.getId()));
        assertEquals(0, version(product.getId()));
        assertEquals(1, cartItemCount(user.getId()));
        assertEquals(0L, rowCount("orders"));
        assertEquals(0L, rowCount("order_item"));
    }

    @Test
    void concurrentCheckoutsCommitExactlyOneOrderAndPreserveLosingCart() throws Exception {
        Product product = createProduct(1);
        List<User> customers = List.of(createCart(product, 1), createCart(product, 1));
        CountDownLatch bothRead = new CountDownLatch(2);
        CountDownLatch checkoutTogether = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);
        List<Future<OrderResponse>> attempts = new ArrayList<>();
        List<User> winners = new ArrayList<>();
        List<User> losers = new ArrayList<>();

        try {
            for (User user : customers) {
                attempts.add(executor.submit(() -> {
                    authenticate(user);
                    try {
                        return transactions.execute(status -> {
                            Cart cart = carts.findByUser_Id(user.getId()).orElseThrow();
                            assertEquals(1, cart.getItems().get(0).getProduct().getQuantity());
                            bothRead.countDown();
                            await(checkoutTogether);
                            return orderService.checkout(checkoutRequest);
                        });
                    } finally {
                        SecurityContextHolder.clearContext();
                    }
                }));
            }
            assertTrue(bothRead.await(15, TimeUnit.SECONDS), "Both transactions must read the last item");
            checkoutTogether.countDown();

            for (int index = 0; index < attempts.size(); index++) {
                try {
                    assertNotNull(attempts.get(index).get(30, TimeUnit.SECONDS));
                    winners.add(customers.get(index));
                } catch (ExecutionException exception) {
                    assertInstanceOf(ObjectOptimisticLockingFailureException.class, exception.getCause());
                    losers.add(customers.get(index));
                }
            }
        } finally {
            checkoutTogether.countDown();
            executor.shutdownNow();
            assertTrue(executor.awaitTermination(15, TimeUnit.SECONDS), "Checkout workers must stop");
        }

        assertEquals(1, winners.size());
        assertEquals(1, losers.size());
        assertEquals(0, stock(product.getId()));
        assertEquals(1, version(product.getId()));
        assertEquals(1L, rowCount("orders"));
        assertEquals(1L, rowCount("order_item"));
        assertEquals(winners.get(0).getId(), jdbc.queryForObject("SELECT user_id FROM orders", UUID.class));
        assertEquals(0, cartItemCount(winners.get(0).getId()));
        assertEquals(1, cartItemCount(losers.get(0).getId()));
    }

    @Test
    void cancellationCommitsRefundExactlyOnce() {
        Product product = createProduct(3);
        User user = createCart(product, 2);
        authenticate(user);
        UUID orderId = orderService.checkout(checkoutRequest).id();

        assertEquals(OrderStatus.CANCELLED, orderService.cancelOrder(orderId).status());
        assertThrows(InvalidOrderStateException.class, () -> orderService.cancelOrder(orderId));
        orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

        assertEquals(3, stock(product.getId()));
        assertEquals(2, version(product.getId()));
        assertEquals("CANCELLED", jdbc.queryForObject(
                "SELECT status FROM orders WHERE id = ?", String.class, orderId));
        assertEquals(1L, rowCount("orders"));
        assertEquals(1L, rowCount("order_item"));
        assertEquals(0, cartItemCount(user.getId()));
    }

    private Product createProduct(int quantity) {
        return transactions.execute(status -> {
            String suffix = UUID.randomUUID().toString();
            Category category = categories.save(Category.builder().name("Category " + suffix)
                    .slug(suffix).status(CategoryStatus.ACTIVE).build());
            return products.save(Product.builder().name("Product " + suffix).category(category)
                    .price(new BigDecimal("100000")).quantity(quantity).status(ProductStatus.ACTIVE).build());
        });
    }

    private User createCart(Product product, int quantity) {
        return transactions.execute(status -> {
            User user = users.save(User.builder().email(UUID.randomUUID() + "@example.invalid")
                    .fullName("Integration Customer").role("CUSTOMER").status("ACTIVE")
                    .password(new BCryptPasswordEncoder().encode(UUID.randomUUID().toString())).build());
            Cart cart = Cart.builder().user(user).build();
            cart.addItem(CartItem.builder().product(products.findById(product.getId()).orElseThrow())
                    .quantity(quantity).build());
            carts.save(cart);
            return user;
        });
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private int stock(UUID productId) {
        return jdbc.queryForObject("SELECT quantity FROM product WHERE id = ?", Integer.class, productId);
    }

    private int version(UUID productId) {
        return jdbc.queryForObject("SELECT version FROM product WHERE id = ?", Integer.class, productId);
    }

    private int cartItemCount(UUID userId) {
        return jdbc.queryForObject("SELECT count(*) FROM cart_item ci JOIN cart c ON c.id = ci.cart_id"
                + " WHERE c.user_id = ?", Integer.class, userId);
    }

    private long rowCount(String table) {
        return switch (table) {
            case "orders" -> jdbc.queryForObject("SELECT count(*) FROM orders", Long.class);
            case "order_item" -> jdbc.queryForObject("SELECT count(*) FROM order_item", Long.class);
            default -> throw new IllegalArgumentException("Unexpected table: " + table);
        };
    }

    private void await(CountDownLatch latch) {
        try {
            assertTrue(latch.await(15, TimeUnit.SECONDS), "Timed out waiting for concurrent checkout");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Concurrent checkout was interrupted", exception);
        }
    }
}

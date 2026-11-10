package com.javaweb.ecommerce.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import com.javaweb.ecommerce.dto.record.request.CheckoutRequest;
import com.javaweb.ecommerce.dto.record.response.OrderResponse;
import com.javaweb.ecommerce.entity.Cart;
import com.javaweb.ecommerce.entity.CartItem;
import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.OrderItem;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.exception.EmptyCartException;
import com.javaweb.ecommerce.exception.InsufficientStockException;
import com.javaweb.ecommerce.exception.InvalidOrderStateException;
import com.javaweb.ecommerce.mapper.OrderItemMapperImpl;
import com.javaweb.ecommerce.mapper.OrderMapper;
import com.javaweb.ecommerce.mapper.OrderMapperImpl;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.OrderRepository;
import com.javaweb.ecommerce.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductRepository productRepository;

    private OrderServiceImpl orderService;

    private User customer;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        OrderMapper orderMapper = new OrderMapperImpl();
        ReflectionTestUtils.setField(orderMapper, "orderItemMapper", new OrderItemMapperImpl());
        orderService = new OrderServiceImpl(orderRepository, cartRepository, productRepository, orderMapper);

        customer = User.builder()
                .id(UUID.randomUUID())
                .email("customer@mail.com")
                .role("CUSTOMER")
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                customer, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        product = Product.builder()
                .id(UUID.randomUUID())
                .name("MacBook Pro")
                .price(new BigDecimal("30000000"))
                .quantity(10)
                .version(0)
                .build();

        cart = Cart.builder()
                .id(UUID.randomUUID())
                .user(customer)
                .items(new ArrayList<>())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void checkout_successful_deductsStock_emptiesCart() {
        cart.addItem(CartItem.builder().id(UUID.randomUUID()).product(product).quantity(2).build());

        when(cartRepository.findByUser_Id(customer.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        CheckoutRequest request = new CheckoutRequest(
                "Nguyen Van A", "0912345678", "123 Hanoi", PaymentMethod.BANK_TRANSFER);

        OrderResponse response = orderService.checkout(request);

        assertNotNull(response);
        assertEquals(OrderStatus.PENDING, response.status());
        assertEquals(0, new BigDecimal("60000000").compareTo(response.totalAmount()));
        assertEquals(8, product.getQuantity()); // Stock deducted from 10 to 8
        assertTrue(cart.getItems().isEmpty()); // Cart cleared
        assertTrue(response.paymentInstruction().contains("MBBank"));
    }

    @Test
    void checkout_emptyCart_throwsEmptyCartException() {
        when(cartRepository.findByUser_Id(customer.getId())).thenReturn(Optional.of(cart));

        CheckoutRequest request = new CheckoutRequest(
                "Nguyen Van A", "0912345678", "123 Hanoi", PaymentMethod.COD);

        assertThrows(EmptyCartException.class, () -> orderService.checkout(request));
    }

    @Test
    void checkout_insufficientStock_throwsInsufficientStockException() {
        cart.addItem(CartItem.builder().id(UUID.randomUUID()).product(product).quantity(15).build());

        when(cartRepository.findByUser_Id(customer.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        CheckoutRequest request = new CheckoutRequest(
                "Nguyen Van A", "0912345678", "123 Hanoi", PaymentMethod.COD);

        assertThrows(InsufficientStockException.class, () -> orderService.checkout(request));
        assertEquals(10, product.getQuantity()); // Stock unchanged
    }

    @Test
    void cancelOrder_pending_refundsStock_setsCancelled() {
        UUID orderId = UUID.randomUUID();
        product.setQuantity(8);

        Order order = Order.builder()
                .id(orderId)
                .user(customer)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("60000000"))
                .paymentMethod(PaymentMethod.COD)
                .shippingAddress("123 Hanoi")
                .phoneNumber("0912345678")
                .receiverName("Nguyen Van A")
                .items(new ArrayList<>())
                .build();

        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .product(product)
                .quantity(2)
                .price(product.getPrice())
                .build();
        order.addItem(item);

        when(orderRepository.findWithDetailsById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.cancelOrder(orderId);

        assertEquals(OrderStatus.CANCELLED, response.status());
        assertEquals(10, product.getQuantity()); // Stock refunded from 8 to 10
        verify(productRepository).save(product);
    }

    @Test
    void cancelOrder_notPending_throwsInvalidOrderStateException() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .user(customer)
                .status(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findWithDetailsById(orderId)).thenReturn(Optional.of(order));

        assertThrows(InvalidOrderStateException.class, () -> orderService.cancelOrder(orderId));
    }

    @Test
    void cancelOrder_notOwner_throwsAccessDeniedException() {
        UUID orderId = UUID.randomUUID();
        User anotherUser = User.builder().id(UUID.randomUUID()).role("CUSTOMER").build();

        Order order = Order.builder()
                .id(orderId)
                .user(anotherUser)
                .status(OrderStatus.PENDING)
                .build();

        when(orderRepository.findWithDetailsById(orderId)).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class, () -> orderService.cancelOrder(orderId));
    }
}


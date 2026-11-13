package com.javaweb.ecommerce.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.javaweb.ecommerce.dto.record.request.CheckoutRequest;
import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.OrderItem;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.exception.InvalidOrderStateException;
import com.javaweb.ecommerce.mapper.OrderMapper;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.OrderRepository;
import com.javaweb.ecommerce.repository.ProductRepository;

import jakarta.validation.Validation;

@ExtendWith(MockitoExtension.class)
class OrderWorkflowRegressionTest {
    @Mock private OrderRepository orders;
    @Mock private CartRepository carts;
    @Mock private ProductRepository products;
    @Mock private OrderMapper mapper;

    @ParameterizedTest
    @CsvSource({
        "PENDING,CONFIRMED", "PENDING,CANCELLED", "CONFIRMED,SHIPPED",
        "CONFIRMED,CANCELLED", "SHIPPED,DELIVERED"
    })
    void allowsForwardTransitionsAndRefundsOnlyCancellation(OrderStatus initial, OrderStatus next) {
        Product product = Product.builder().quantity(8).build();
        Order order = Order.builder().id(UUID.randomUUID()).status(initial).build();
        order.addItem(OrderItem.builder().product(product).quantity(2).build());
        when(orders.findWithDetailsById(order.getId())).thenReturn(Optional.of(order));
        when(orders.save(order)).thenReturn(order);

        new OrderServiceImpl(orders, carts, products, mapper).updateOrderStatus(order.getId(), next);

        assertEquals(next, order.getStatus());
        assertEquals(next == OrderStatus.CANCELLED ? 10 : 8, product.getQuantity());
        verify(orders).save(order);
    }

    @ParameterizedTest
    @CsvSource({
        "PENDING,SHIPPED", "PENDING,DELIVERED", "CONFIRMED,PENDING",
        "SHIPPED,PENDING", "SHIPPED,CANCELLED", "DELIVERED,CANCELLED", "CANCELLED,CONFIRMED"
    })
    void rejectsSkippingReversingAndReopeningOrders(OrderStatus initial, OrderStatus next) {
        Order order = Order.builder().id(UUID.randomUUID()).status(initial).build();
        when(orders.findWithDetailsById(order.getId())).thenReturn(Optional.of(order));

        assertThrows(InvalidOrderStateException.class,
                () -> new OrderServiceImpl(orders, carts, products, mapper).updateOrderStatus(order.getId(), next));

        assertEquals(initial, order.getStatus());
        verify(orders, never()).save(any());
        verify(products, never()).save(any());
    }

    @Test
    void retryingCancelledStatusDoesNotRefundTwice() {
        Product product = Product.builder().quantity(10).build();
        Order order = Order.builder().id(UUID.randomUUID()).status(OrderStatus.CANCELLED).build();
        order.addItem(OrderItem.builder().product(product).quantity(2).build());
        when(orders.findWithDetailsById(order.getId())).thenReturn(Optional.of(order));

        new OrderServiceImpl(orders, carts, products, mapper).updateOrderStatus(order.getId(), OrderStatus.CANCELLED);

        assertEquals(10, product.getQuantity());
        verify(products, never()).save(any());
        verify(orders, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = { "0|12345678", "00312345678", "091234567", "09123456789", "0312345678" })
    void validatesPhoneNumbers(String phone) {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var request = new CheckoutRequest("Demo", phone, "Demo address", PaymentMethod.COD);
            boolean valid = factory.getValidator().validate(request).isEmpty();
            assertEquals(phone.equals("0312345678"), valid);
        }
    }

    @Test
    void bankTransferInstructionClearlyIdentifiesSimulation() {
        Order order = Order.builder().id(UUID.randomUUID()).totalAmount(BigDecimal.TEN)
                .paymentMethod(PaymentMethod.BANK_TRANSFER).build();
        String instruction = org.mockito.Mockito.mock(OrderMapper.class,
                org.mockito.Mockito.CALLS_REAL_METHODS).generatePaymentInstruction(order);
        assertTrue(instruction.contains("mô phỏng"));
        assertTrue(instruction.contains("Demo không yêu cầu chuyển tiền"));
    }
}

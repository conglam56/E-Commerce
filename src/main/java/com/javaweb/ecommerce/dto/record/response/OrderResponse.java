package com.javaweb.ecommerce.dto.record.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;

import lombok.Builder;

@Builder
public record OrderResponse(
        UUID id,
        BigDecimal totalAmount,
        OrderStatus status,
        PaymentMethod paymentMethod,
        String shippingAddress,
        String phoneNumber,
        String receiverName,
        List<OrderItemResponse> items,
        String paymentInstruction,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

}


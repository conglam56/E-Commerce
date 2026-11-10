package com.javaweb.ecommerce.dto.record.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;

@Builder
public record CartResponse(
                UUID id,
                List<CartItemResponse> items,
                BigDecimal totalPrice,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {

}

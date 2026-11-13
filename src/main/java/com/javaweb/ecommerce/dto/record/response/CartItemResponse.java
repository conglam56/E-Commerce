package com.javaweb.ecommerce.dto.record.response;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;

@Builder
public record CartItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String productImageUrl,
        BigDecimal productPrice,
        Integer quantity) {

}

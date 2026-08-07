package com.javaweb.ecommerce.dto.record.response;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;

@Builder
public record ProductResponse(
        UUID id,
        String name,
        Integer quantity,
        String description,
        String imageUrl,
        BigDecimal price,
        String categoryName) {
}

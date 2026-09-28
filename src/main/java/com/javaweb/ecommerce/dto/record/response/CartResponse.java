package com.javaweb.ecommerce.dto.record.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;

@Builder
public record CartResponse(
                UUID id,
                List<CartItemResponse> items,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {

}

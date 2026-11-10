package com.javaweb.ecommerce.dto.record.request;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull UUID productId,
        @NotNull @Min(1) Integer quantity) {

}

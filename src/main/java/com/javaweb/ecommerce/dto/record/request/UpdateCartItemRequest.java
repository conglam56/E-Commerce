package com.javaweb.ecommerce.dto.record.request;

import jakarta.validation.constraints.NotNull;

public record UpdateCartItemRequest(
        @NotNull Integer quantity) {

}


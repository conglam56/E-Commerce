package com.javaweb.ecommerce.dto.record.request;

import java.util.UUID;

public record CartItemRequest(
        UUID productId,
        Integer quantity) {

}

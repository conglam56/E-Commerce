package com.javaweb.ecommerce.dto.record.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductRequest(
        @NotBlank(message = "Tên sản phẩm không được để trống!")
        String name,
        @NotNull(message = "Số lượng không được để trống!")
        @Positive(message = "Số lượng phải là số dương")
        Integer quantity,
        String description,
        String imageUrl,
        @NotNull(message = "Giá tiền không được để trống!")
        @Positive(message = "Giá tiền phải là số dương")
        BigDecimal price,
        UUID categoryId) {

}

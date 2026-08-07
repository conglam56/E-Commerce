package com.javaweb.ecommerce.dto.record.request;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank(message = "Tên danh mục không được để trống!")
        String name,
        String slug) {

}

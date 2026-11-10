package com.javaweb.ecommerce.dto.record.request;

import com.javaweb.ecommerce.entity.enums.OrderStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Trạng thái mới không được để trống")
        OrderStatus status) {

}

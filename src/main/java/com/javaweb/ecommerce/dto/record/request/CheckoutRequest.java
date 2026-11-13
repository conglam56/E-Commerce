package com.javaweb.ecommerce.dto.record.request;

import com.javaweb.ecommerce.entity.enums.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank(message = "Tên người nhận không được để trống")
        @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
        String receiverName,

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^0[35789][0-9]{8}$", message = "Số điện thoại không hợp lệ")
        String phoneNumber,

        @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
        String shippingAddress,

        @NotNull(message = "Phương thức thanh toán không được để trống")
        PaymentMethod paymentMethod) {

}


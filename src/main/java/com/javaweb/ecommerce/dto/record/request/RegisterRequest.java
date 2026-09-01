package com.javaweb.ecommerce.dto.record.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "Fullname không được để trống") String fullName,
        @Email(message = "Email không hợp lệ") @NotBlank(message = "Email không được để trống") String email,

        @NotBlank(message = "Password không được để trống") String password,

        @NotBlank(message = "Confirm Password không được để trống") String confirmPassword) {

}

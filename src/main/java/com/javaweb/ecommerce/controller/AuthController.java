package com.javaweb.ecommerce.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.dto.record.request.LoginRequest;
import com.javaweb.ecommerce.dto.record.request.RegisterRequest;
import com.javaweb.ecommerce.dto.record.response.AuthResponse;
import com.javaweb.ecommerce.service.AuthService;
import com.javaweb.ecommerce.common.BaseController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController extends BaseController {
    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return success(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return success(authService.register(registerRequest));
    }
}

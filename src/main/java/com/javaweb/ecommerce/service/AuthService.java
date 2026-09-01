package com.javaweb.ecommerce.service;

import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.LoginRequest;
import com.javaweb.ecommerce.dto.record.request.RegisterRequest;
import com.javaweb.ecommerce.dto.record.response.AuthResponse;

@Service
public interface AuthService {
    AuthResponse register(RegisterRequest registerRequest);

    AuthResponse login(LoginRequest loginRequest);
}

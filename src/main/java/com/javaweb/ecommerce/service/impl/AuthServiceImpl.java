package com.javaweb.ecommerce.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.LoginRequest;
import com.javaweb.ecommerce.dto.record.request.RegisterRequest;
import com.javaweb.ecommerce.dto.record.response.AuthResponse;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.repository.UserRepository;
import com.javaweb.ecommerce.security.jwt.JwtService;
import com.javaweb.ecommerce.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public AuthResponse register(RegisterRequest registerRequest) {
                if (!registerRequest.password().equals(registerRequest.confirmPassword())) {
                        throw new IllegalArgumentException("Mật khẩu và xác nhận mật khẩu không khớp");
                }
                userRepository.findByEmail(registerRequest.email())
                                .ifPresent(user -> {
                                        throw new IllegalStateException("Email đã tồn tại");
                                });

                User user = User.builder()
                                .email(registerRequest.email())
                                .password(passwordEncoder.encode(registerRequest.password()))
                                .fullName(registerRequest.fullName())
                                .role("CUSTOMER")
                                .status("ACTIVE")
                                .build();
                userRepository.save(user);
                String token = jwtService.generateToken(user);
                AuthResponse response = AuthResponse.builder()
                                .token(token)
                                .build();
                return response;
        }

        @Override
        public AuthResponse login(LoginRequest loginRequest) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.email(),
                                                loginRequest.password()));
                User user = userRepository.findByEmail(loginRequest.email())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                String token = jwtService.generateToken(user);
                AuthResponse response = AuthResponse.builder()
                                .token(token)
                                .build();
                return response;
        }

}

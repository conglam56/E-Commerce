package com.javaweb.ecommerce.service.impl;

import java.nio.charset.StandardCharsets;
import com.javaweb.ecommerce.service.AccountLinks;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javaweb.ecommerce.dto.record.request.ChangePasswordRequest;
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

        private final AccountLinks accountLinks;
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
                accountLinks.requestVerification(user.getEmail());
                String token = jwtService.generateToken(user);
                AuthResponse response = AuthResponse.builder()
                                .token(token)
                                .build();
                return response;
        }

        @Override
        public AuthResponse login(LoginRequest loginRequest) {
                var authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.email(),
                                                loginRequest.password()));
                User user = (User) authentication.getPrincipal();
                String token = jwtService.generateToken(user);
                AuthResponse response = AuthResponse.builder()
                                .token(token)
                                .build();
                return response;
        }

        @Override
        @Transactional
        public void changePassword(User user, ChangePasswordRequest request) {
                String newPassword = request.newPassword();
                if (!newPassword.equals(request.confirmPassword())) {
                        throw new IllegalArgumentException("Mật khẩu xác nhận không khớp.");
                }
                if (newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
                        throw new IllegalArgumentException("Mật khẩu mới vượt quá 72 byte UTF-8.");
                }

                String currentHash = user.getPassword();
                if (!passwordEncoder.matches(request.currentPassword(), currentHash)) {
                        throw new IllegalArgumentException("Mật khẩu hiện tại không đúng.");
                }
                if (passwordEncoder.matches(newPassword, currentHash)) {
                        throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại.");
                }

                String newHash = passwordEncoder.encode(newPassword);
                if (userRepository.updatePassword(user.getId(), currentHash, newHash) != 1) {
                        throw new IllegalStateException("Mật khẩu đã thay đổi. Vui lòng thử lại.");
                }
        }

}

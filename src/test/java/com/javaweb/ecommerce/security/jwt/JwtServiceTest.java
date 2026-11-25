package com.javaweb.ecommerce.security.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Base64;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.javaweb.ecommerce.entity.User;

class JwtServiceTest {

    @Test
    void tokenContainsFullNameAndPreservesAuthenticationClaims() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", Base64.getEncoder().encodeToString(new byte[32]));
        ReflectionTestUtils.setField(jwtService, "expiration", 60000L);
        User user = User.builder()
                .email("customer@example.com")
                .fullName("Nguyễn Văn An")
                .password("encoded-password")
                .role("CUSTOMER")
                .status("ACTIVE")
                .build();

        String token = jwtService.generateToken(user);

        assertEquals(user.getFullName(), jwtService.extractAllClaims(token).get("fullName", String.class));
        assertEquals(user.getEmail(), jwtService.extractUsername(token));
        assertTrue(jwtService.extractAllClaims(token).containsKey("roles"));
        assertTrue(jwtService.validateToken(token, user));
    }
}

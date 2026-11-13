package com.javaweb.ecommerce.security.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
    @Mock private JwtService jwt;
    @Mock private UserDetailsService users;
    @Mock private FilterChain chain;

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void malformedTokenReturnsJsonUnauthorized() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/cart");
        request.addHeader("Authorization", "Bearer broken");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(jwt.extractUsername("broken")).thenThrow(new MalformedJwtException("Malformed token"));

        new JwtAuthenticationFilter(jwt, users).doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals("application/json;charset=UTF-8", response.getContentType());
        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void disabledUserCannotAuthenticateWithExistingToken() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/cart");
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(jwt.extractUsername("token")).thenReturn("disabled@example.test");
        when(users.loadUserByUsername("disabled@example.test")).thenReturn(User.withUsername("disabled@example.test")
                .password("unused").roles("CUSTOMER").disabled(true).build());

        new JwtAuthenticationFilter(jwt, users).doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        verify(chain, never()).doFilter(any(), any());
    }
}

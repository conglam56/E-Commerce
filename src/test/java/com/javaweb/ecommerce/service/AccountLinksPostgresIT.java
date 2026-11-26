package com.javaweb.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest(showSql = false, properties = "spring.config.import=")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Testcontainers
class AccountLinksPostgresIT {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private JdbcTemplate jdbc;
    private final UUID id = UUID.randomUUID();
    private final String email = id + "@example.invalid";
    private final AccountMail mail = mock(AccountMail.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private AccountLinks links;

    @BeforeEach
    void setUp() {
        jdbc.update("INSERT INTO users(id, email, password, full_name) VALUES(?, ?, ?, ?)",
                id, email, encoder.encode("initial-password"), "Test Customer");
        when(mail.available()).thenReturn(true);
        links = new AccountLinks(jdbc, mail, encoder);
    }

    private String deliveredToken(String path, int count) {
        var token = ArgumentCaptor.forClass(String.class);
        verify(mail, times(count)).send(eq(email), eq(path), token.capture());
        return token.getValue();
    }

    @Test
    void verificationRequiresTheCorrectAccountAndAnUnexpiredUnusedToken() {
        links.requestVerification(email);
        links.requestVerification(email);
        String first = deliveredToken("/verify-email", 1);
        assertTrue(jdbc.queryForObject("""
                SELECT verification_hash <> ? AND length(verification_hash) = 64 AND
                    verification_expires BETWEEN now() + interval '23 hours 59 minutes' AND now() + interval '24 hours'
                FROM users WHERE id = ?
                """, Boolean.class, first, id));
        assertThrows(IllegalArgumentException.class, () -> links.verify(UUID.randomUUID(), first));
        jdbc.update("UPDATE users SET verification_expires = now() WHERE id = ?", id);
        assertThrows(IllegalArgumentException.class, () -> links.verify(id, first));
        links.requestVerification(email);
        String next = deliveredToken("/verify-email", 2);
        assertThrows(IllegalArgumentException.class, () -> links.verify(id, first));
        links.verify(id, next);
        assertThrows(IllegalArgumentException.class, () -> links.verify(id, next));
        assertTrue(jdbc.queryForObject("SELECT email_verified AND verification_hash IS NULL FROM users WHERE id = ?",
                Boolean.class, id));
    }

    @Test
    void resetIsAvailableOnlyForVerifiedAccountsAndExpires() {
        links.requestReset(email);
        links.requestReset("missing@example.invalid");
        verify(mail, never()).send(anyString(), anyString(), anyString());
        jdbc.update("UPDATE users SET email_verified = true WHERE id = ?", id);
        links.requestReset(email);
        links.requestReset(email);
        String first = deliveredToken("/reset-password", 1);
        assertTrue(jdbc.queryForObject("""
                SELECT reset_hash <> ? AND length(reset_hash) = 64 AND
                    reset_expires BETWEEN now() + interval '14 minutes' AND now() + interval '15 minutes'
                FROM users WHERE id = ?
                """, Boolean.class, first, id));
        jdbc.update("UPDATE users SET reset_expires = now() WHERE id = ?", id);
        assertThrows(IllegalArgumentException.class, () -> links.reset(first, "replacement", "replacement"));
        links.requestReset(email);
        String next = deliveredToken("/reset-password", 2);
        assertThrows(IllegalArgumentException.class, () -> links.reset(first, "replacement", "replacement"));
        assertThrows(IllegalArgumentException.class, () -> links.reset(next, "replacement", "mismatch"));
        links.reset(next, "replacement", "replacement");
    }

    @Test
    void simultaneousResetsConsumeTheLinkAndIncrementSessionVersionOnce() throws Exception {
        jdbc.update("UPDATE users SET email_verified = true WHERE id = ?", id);
        links.requestReset(email);
        String token = deliveredToken("/reset-password", 1);
        var start = new CyclicBarrier(2);
        Callable<Boolean> reset = () -> {
            start.await(10, TimeUnit.SECONDS);
            try {
                links.reset(token, "replacement", "replacement");
                return true;
            } catch (IllegalArgumentException invalidLink) {
                assertEquals("Liên kết không hợp lệ hoặc đã hết hạn.", invalidLink.getMessage());
                return false;
            }
        };
        var pool = Executors.newFixedThreadPool(2);
        try {
            var first = pool.submit(reset);
            var second = pool.submit(reset);
            assertNotEquals(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS));
        } finally {
            pool.shutdownNow();
        }
        assertThrows(IllegalArgumentException.class, () -> links.reset(token, "another-password", "another-password"));
        assertTrue(jdbc.queryForObject("SELECT session_version = 1 AND reset_hash IS NULL FROM users WHERE id = ?",
                Boolean.class, id));
        assertTrue(encoder.matches("replacement", jdbc.queryForObject("SELECT password FROM users WHERE id = ?", String.class, id)));
    }
}

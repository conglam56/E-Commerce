package com.javaweb.ecommerce.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountLinks {
    private final JdbcTemplate jdbc;
    private final AccountMail mail;
    private final PasswordEncoder encoder;
    private final SecureRandom random = new SecureRandom();

    public void requestVerification(String email) {
        if (!mail.available()) return;
        String token = newToken();
        int rows = jdbc.update("""
                UPDATE users SET verification_hash = ?, verification_expires = now() + interval '24 hours'
                WHERE email = ? AND status = 'ACTIVE' AND NOT email_verified
                AND (verification_expires IS NULL OR verification_expires <= now() + interval '23 hours 59 minutes')
                """, digest(token), email);
        if (rows == 1) mail.send(email, "/verify-email", token);
    }

    public void requestReset(String email) {
        if (!mail.available()) return;
        String token = newToken();
        int rows = jdbc.update("""
                UPDATE users SET reset_hash = ?, reset_expires = now() + interval '15 minutes'
                WHERE email = ? AND status = 'ACTIVE' AND email_verified
                AND (reset_expires IS NULL OR reset_expires <= now() + interval '14 minutes')
                """, digest(token), email);
        if (rows == 1) mail.send(email, "/reset-password", token);
    }

    public void verify(UUID userId, String token) {
        requireUpdated(jdbc.update("""
                UPDATE users SET email_verified = true, verification_hash = NULL, verification_expires = NULL
                WHERE id = ? AND verification_hash = ? AND verification_expires > now() AND status = 'ACTIVE'
                """, userId, digest(token)));
    }

    public void reset(String token, String password, String confirmation) {
        if (!password.equals(confirmation)) throw new IllegalArgumentException("Mật khẩu xác nhận không khớp.");
        if (password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new IllegalArgumentException("Mật khẩu mới vượt quá 72 byte UTF-8.");
        String hash = digest(token);
        Boolean valid = jdbc.queryForObject("""
                SELECT EXISTS(SELECT 1 FROM users WHERE reset_hash = ? AND reset_expires > now()
                             AND email_verified AND status = 'ACTIVE')
                """, Boolean.class, hash);
        if (!Boolean.TRUE.equals(valid)) throw invalidLink();
        requireUpdated(jdbc.update("""
                UPDATE users SET password = ?, session_version = session_version + 1, reset_hash = NULL, reset_expires = NULL
                WHERE reset_hash = ? AND reset_expires > now() AND email_verified AND status = 'ACTIVE'
                """, encoder.encode(password), hash));
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String digest(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private void requireUpdated(int rows) {
        if (rows != 1) throw invalidLink();
    }

    private IllegalArgumentException invalidLink() {
        return new IllegalArgumentException("Liên kết không hợp lệ hoặc đã hết hạn.");
    }
}

package com.javaweb.ecommerce.service;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountMail {
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    @Value("${account.mail.endpoint:https://api.resend.com/emails}") private URI endpoint;
    @Value("${account.mail.key:}") private String key;
    @Value("${account.mail.from:}") private String from;
    @Value("${account.public-url:}") private String publicUrl;

    public boolean available() {
        return !key.isBlank() && !from.isBlank() && !publicUrl.isBlank();
    }

    @Async
    public void send(String email, String path, String token) {
        String subject = path.equals("/verify-email") ? "Xác minh email" : "Đặt lại mật khẩu";
        String link = publicUrl.replaceAll("/+$", "") + path + "#" + token;
        try {
            String body = mapper.writeValueAsString(Map.of("from", from, "to", List.of(email),
                    "subject", subject + " · The Tech Shop", "text", subject + " tại The Tech Shop:\n" + link
                    + "\nNếu bạn không yêu cầu, hãy bỏ qua thư này."));
            HttpRequest request = HttpRequest.newBuilder(endpoint).timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + key).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body)).build();
            int status = client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
            if (status / 100 != 2) log.warn("Account email delivery returned HTTP {}", status);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("Account email delivery interrupted");
        } catch (java.io.IOException ex) {
            log.warn("Account email delivery failed ({})", ex.getClass().getSimpleName());
        }
    }
}

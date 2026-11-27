package com.javaweb.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import lombok.Getter;

@Component
@Getter
public class VnpayConfig {
    @Value("${payment.vnpay.tmn-code:}") private String tmnCode;
    @Value("${payment.vnpay.hash-secret:}") private String hashSecret;
    @Value("${account.public-url}") private String publicUrl;

    public boolean available() {
        return !tmnCode.isBlank() && !hashSecret.isBlank();
    }
}

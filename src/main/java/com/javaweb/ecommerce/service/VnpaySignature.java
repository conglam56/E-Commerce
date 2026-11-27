package com.javaweb.ecommerce.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import com.javaweb.ecommerce.config.VnpayConfig;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class VnpaySignature {
    private final VnpayConfig config;

    public String query(Map<String, String> parameters) {
        return new TreeMap<>(parameters).entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("vnp_")
                        && !entry.getKey().equals("vnp_SecureHash") && !entry.getKey().equals("vnp_SecureHashType")
                        && entry.getValue() != null && !entry.getValue().isEmpty())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    public String sign(Map<String, String> parameters) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(config.getHashSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return HexFormat.of().formatHex(mac.doFinal(query(parameters).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Cannot sign VNPay request", ex);
        }
    }

    public boolean valid(Map<String, String> parameters) {
        String received = parameters.getOrDefault("vnp_SecureHash", "");
        return config.available() && received.matches("[a-fA-F0-9]{128}")
                && MessageDigest.isEqual(sign(parameters).getBytes(StandardCharsets.US_ASCII),
                        received.toLowerCase(java.util.Locale.ROOT).getBytes(StandardCharsets.US_ASCII))
                && config.getTmnCode().equals(parameters.get("vnp_TmnCode"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}

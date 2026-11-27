package com.javaweb.ecommerce.controller;

import java.util.Map;
import java.util.UUID;
import java.util.HashMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.MultiValueMap;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.config.VnpayConfig;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.service.VnpayPayments;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final VnpayPayments payments;
    private final VnpayConfig config;

    @GetMapping("/availability")
    public ApiResponse<Boolean> availability() {
        return ApiResponse.success(config.available());
    }

    @PostMapping("/{orderId}")
    public ApiResponse<String> start(@PathVariable UUID orderId, @AuthenticationPrincipal User user, HttpServletRequest request) {
        return ApiResponse.success(payments.paymentUrl(orderId, user, request.getRemoteAddr()));
    }

    @GetMapping("/ipn")
    public Map<String, String> notify(@RequestParam MultiValueMap<String, String> query) {
        Map<String, String> parameters = new HashMap<>();
        for (var entry : query.entrySet()) {
            if (entry.getValue().size() != 1) return Map.of("RspCode", "97", "Message", "Duplicate parameter");
            parameters.put(entry.getKey(), entry.getValue().get(0));
        }
        try {
            return payments.notify(parameters);
        } catch (RuntimeException ex) {
            log.error("Could not commit VNPay notification", ex);
            return Map.of("RspCode", "99", "Message", "Please retry");
        }
    }
}

package com.javaweb.ecommerce.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PaymentExpiry {
    private final VnpayPayments payments;

    @Scheduled(fixedDelay = 60000, initialDelay = 60000)
    public void expireUnpaidOrders() {
        payments.expire();
    }
}

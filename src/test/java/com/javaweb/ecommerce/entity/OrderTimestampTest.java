package com.javaweb.ecommerce.entity;

import static org.junit.jupiter.api.Assertions.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.TimeZone;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.ResourceLock;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.mapper.OrderMapperImpl;

@ResourceLock("default-time-zone")
class OrderTimestampTest {
    private final OrderMapperImpl mapper = new OrderMapperImpl();
    private final ObjectMapper json = new ObjectMapper().registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @ParameterizedTest
    @ValueSource(strings = {"UTC", "Asia/Ho_Chi_Minh"})
    void legacyStoredWallTimeIsReturnedWithItsServerOffset(String zone) throws Exception {
        TimeZone previous = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone(zone));
            Instant created = Instant.parse("2026-11-27T03:14:00Z");
            LocalDateTime expiry = LocalDateTime.parse("2026-11-27T03:29:00");
            Order order = Order.builder().paymentMethod(PaymentMethod.COD)
                    .createdAt(LocalDateTime.ofInstant(created, ZoneId.systemDefault()))
                    .updatedAt(LocalDateTime.ofInstant(created.plusSeconds(60), ZoneId.systemDefault()))
                    .paymentExpiresAt(expiry).build();
            var response = json.readTree(json.writeValueAsString(mapper.toResponse(order)));
            assertEquals(created, OffsetDateTime.parse(response.get("createdAt").asText()).toInstant());
            assertEquals(created.plusSeconds(60), OffsetDateTime.parse(response.get("updatedAt").asText()).toInstant());
            assertEquals(expiry, LocalDateTime.parse(response.get("paymentExpiresAt").asText()));
        } finally {
            TimeZone.setDefault(previous);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"UTC", "Asia/Ho_Chi_Minh"})
    void newlyCreatedAndUpdatedOrderReturnActualInstants(String zone) throws Exception {
        TimeZone previous = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone(zone));
            Order order = Order.builder().paymentMethod(PaymentMethod.COD).build();
            Instant before = Instant.now();
            order.onCreate();
            order.onUpdate();
            Instant after = Instant.now();
            var response = json.readTree(json.writeValueAsString(mapper.toResponse(order)));
            Instant created = OffsetDateTime.parse(response.get("createdAt").asText()).toInstant();
            Instant updated = OffsetDateTime.parse(response.get("updatedAt").asText()).toInstant();
            assertFalse(created.isBefore(before));
            assertFalse(updated.isBefore(created));
            assertFalse(updated.isAfter(after));
        } finally {
            TimeZone.setDefault(previous);
        }
    }

    @Test
    void missingTimestampsRemainNull() throws Exception {
        Order order = Order.builder().paymentMethod(PaymentMethod.COD).build();
        var response = json.readTree(json.writeValueAsString(mapper.toResponse(order)));
        assertTrue(response.get("createdAt").isNull());
        assertTrue(response.get("updatedAt").isNull());
    }
}

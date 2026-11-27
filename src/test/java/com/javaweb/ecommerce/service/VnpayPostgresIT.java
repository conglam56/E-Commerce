package com.javaweb.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import com.javaweb.ecommerce.config.VnpayConfig;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.exception.InvalidOrderStateException;
import com.javaweb.ecommerce.mapper.OrderMapperImpl;
import com.javaweb.ecommerce.mapper.OrderItemMapperImpl;
import com.javaweb.ecommerce.service.impl.OrderServiceImpl;

@DataJpaTest(showSql = false, properties = "spring.config.import=")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({VnpayConfig.class, VnpaySignature.class, VnpayPayments.class,
        OrderServiceImpl.class, OrderMapperImpl.class, OrderItemMapperImpl.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Testcontainers
class VnpayPostgresIT {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
    private static final String secret = UUID.randomUUID().toString();

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("payment.vnpay.tmn-code", () -> "TESTCODE");
        registry.add("payment.vnpay.hash-secret", () -> secret);
        registry.add("account.public-url", () -> "http://localhost:5173");
    }

    @Autowired private JdbcTemplate jdbc;
    @Autowired private VnpayPayments payments;
    @Autowired private VnpaySignature signature;
    @Autowired private OrderService orderService;
    private final UUID orderId = UUID.randomUUID();
    private final UUID productId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void fixture() {
        UUID categoryId = UUID.randomUUID();
        jdbc.update("INSERT INTO users(id,email,password,full_name) VALUES(?,?,?,?)",
                userId, userId + "@example.invalid", "unused-test-hash", "Payment Customer");
        jdbc.update("INSERT INTO category(id,name,slug) VALUES(?,?,?)", categoryId, categoryId.toString(), categoryId.toString());
        jdbc.update("INSERT INTO product(id,name,quantity,category_id,price) VALUES(?,?,0,?,100000)",
                productId, productId.toString(), categoryId);
        jdbc.update("""
                INSERT INTO orders(id,user_id,total_amount,status,payment_method,shipping_address,phone_number,
                    receiver_name,created_at,updated_at,payment_expires_at)
                VALUES(?,?,100000,'PENDING','VNPAY','Test address','0912345678','Payment Customer',now(),now(),?)
                """, orderId, userId, LocalDateTime.now(ZoneOffset.UTC).plusMinutes(15));
        jdbc.update("INSERT INTO order_item(id,order_id,product_id,quantity,price) VALUES(?,?,?,1,100000)",
                UUID.randomUUID(), orderId, productId);
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    private Map<String, String> notification(boolean success) {
        Map<String, String> parameters = new HashMap<>();
        parameters.put("vnp_TmnCode", "TESTCODE");
        parameters.put("vnp_TxnRef", orderId.toString().replace("-", ""));
        parameters.put("vnp_Amount", "10000000");
        parameters.put("vnp_ResponseCode", success ? "00" : "24");
        parameters.put("vnp_TransactionStatus", success ? "00" : "02");
        parameters.put("vnp_TransactionNo", Long.toUnsignedString(UUID.randomUUID().getMostSignificantBits()));
        parameters.put("vnp_PayDate", LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        return signed(parameters);
    }

    private Map<String, String> signed(Map<String, String> parameters) {
        parameters.put("vnp_SecureHash", signature.sign(parameters));
        return parameters;
    }

    private String paymentStatus() {
        return jdbc.queryForObject("SELECT payment_status FROM orders WHERE id = ?", String.class, orderId);
    }

    private int stock() {
        return jdbc.queryForObject("SELECT quantity FROM product WHERE id = ?", Integer.class, productId);
    }

    @Test
    void successfulDuplicateNotificationsCommitExactlyOnceEvenConcurrently() throws Exception {
        Map<String, String> parameters = notification(true);
        var start = new CyclicBarrier(2);
        var pool = Executors.newFixedThreadPool(2);
        try {
            java.util.concurrent.Callable<String> notify = () -> {
                start.await(10, TimeUnit.SECONDS);
                return payments.notify(parameters).get("RspCode");
            };
            var first = pool.submit(notify);
            var second = pool.submit(notify);
            assertEquals(Set.of("00", "02"), Set.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS)));
        } finally {
            pool.shutdownNow();
        }
        assertEquals("PAID", paymentStatus());
        assertEquals("CONFIRMED", jdbc.queryForObject("SELECT status FROM orders WHERE id = ?", String.class, orderId));
        assertEquals(1, jdbc.queryForObject("SELECT version FROM orders WHERE id = ?", Integer.class, orderId));
        assertEquals(0, stock());
    }

    @Test
    void tamperedSignatureAndSignedWrongAmountLeaveOrderUnpaid() {
        var parameters = notification(true);
        parameters.put("vnp_Amount", "1");
        assertEquals("97", payments.notify(parameters).get("RspCode"));
        assertEquals("04", payments.notify(signed(parameters)).get("RspCode"));
        assertEquals("UNPAID", paymentStatus());
        assertEquals(0, stock());
    }

    @Test
    void failureRestoresStockExactlyOnce() {
        var parameters = notification(false);
        assertEquals("00", payments.notify(parameters).get("RspCode"));
        assertEquals("02", payments.notify(parameters).get("RspCode"));
        assertEquals("FAILED", paymentStatus());
        assertEquals(1, stock());
    }

    @Test
    void expiryRestoresStockOnceAndLateSuccessRequiresReconciliation() {
        var parameters = notification(true);
        jdbc.update("UPDATE orders SET payment_expires_at = ? WHERE id = ?",
                LocalDateTime.now(ZoneOffset.UTC).minusMinutes(1), orderId);
        payments.expire();
        assertEquals("EXPIRED", paymentStatus());
        assertEquals(1, stock());
        payments.expire();
        assertEquals(1, stock());
        assertEquals("00", payments.notify(parameters).get("RspCode"));
        assertEquals("REVIEW", paymentStatus());
        assertEquals("CANCELLED", jdbc.queryForObject("SELECT status FROM orders WHERE id = ?", String.class, orderId));
        assertEquals(1, stock());
        assertEquals("02", payments.notify(parameters).get("RspCode"));
    }

    @Test
    void callbackAfterCustomerCancellationDoesNotReviveOrderOrRestoreStockAgain() {
        var user = User.builder().id(userId).role("CUSTOMER").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        orderService.cancelOrder(orderId);
        assertEquals(1, stock());
        assertEquals("00", payments.notify(notification(true)).get("RspCode"));
        assertEquals("REVIEW", paymentStatus());
        assertEquals(1, stock());
        assertEquals("CANCELLED", jdbc.queryForObject("SELECT status FROM orders WHERE id = ?", String.class, orderId));
    }

    @Test
    void orderCannotShipBeforePaymentAndPaidOrderCannotBeCancelledWithoutReconciliation() {
        assertThrows(InvalidOrderStateException.class, () -> orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED));
        payments.notify(notification(true));
        assertThrows(InvalidOrderStateException.class, () -> orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED));
        assertEquals("PAID", paymentStatus());
    }

    @Test
    void paymentLinkUsesServerAmountAndRejectsAnotherCustomer() {
        var user = User.builder().id(userId).build();
        String url = payments.paymentUrl(orderId, user, "127.0.0.1");
        assertTrue(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertTrue(url.contains("vnp_Amount=10000000"));
        assertTrue(url.contains("vnp_TxnRef=" + orderId.toString().replace("-", "")));
        assertThrows(AccessDeniedException.class,
                () -> payments.paymentUrl(orderId, User.builder().id(UUID.randomUUID()).build(), "127.0.0.1"));
        payments.notify(notification(true));
        assertThrows(IllegalArgumentException.class, () -> payments.paymentUrl(orderId, user, "127.0.0.1"));
    }
}

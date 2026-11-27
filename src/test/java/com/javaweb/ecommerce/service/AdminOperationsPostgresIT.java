package com.javaweb.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;

@DataJpaTest(showSql = false, properties = "spring.config.import=")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(AdminOperations.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Testcontainers
class AdminOperationsPostgresIT {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private JdbcTemplate jdbc;
    @Autowired private AdminOperations operations;
    @Autowired private PlatformTransactionManager transactionManager;
    private final UUID userId = UUID.randomUUID();
    private final UUID categoryId = UUID.randomUUID();

    @BeforeEach
    void fixture() {
        // The datasource is always the disposable Testcontainers database.
        jdbc.execute("TRUNCATE TABLE order_item, orders, cart_item, cart, product, category, users CASCADE");
        jdbc.update("INSERT INTO users(id,email,password,full_name) VALUES(?,?,?,?)",
                userId, userId + "@example.invalid", "unused-test-hash", "Operations Customer");
        jdbc.update("INSERT INTO category(id,name,slug) VALUES(?,?,?)",
                categoryId, categoryId.toString(), categoryId.toString());
    }

    private UUID order(String status, int amount) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO orders(id,user_id,total_amount,status,payment_method,shipping_address,
                    phone_number,receiver_name,created_at,updated_at)
                VALUES(?,?,?,?,'COD','Test address','0912345678','Test Customer',now(),now())
                """, id, userId, amount, status);
        return id;
    }

    private UUID product(int quantity, String status) {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO product(id,name,quantity,category_id,price,status) VALUES(?,?,?,?,100000,?)",
                id, id.toString(), quantity, categoryId, status);
        return id;
    }

    @Test
    void emptyReportContainsZeroRevenueAndNoHistoryLeak() {
        var report = operations.summary();
        assertEquals(0, report.deliveredRevenue().compareTo(BigDecimal.ZERO));
        assertEquals(0, report.deliveredOrders());
        assertEquals(0, report.lowStockProducts());
        assertTrue(report.orderCounts().isEmpty());
        assertEquals(0, operations.lowStock(PageRequest.of(0, 20)).getTotalElements());
    }

    @Test
    void revenueUsesDeliveredOrderTotalsOnceAndKeepsHistoricalPurchaseValues() {
        UUID delivered = order("DELIVERED", 100000);
        order("DELIVERED", 200000);
        order("PENDING", 900000);
        order("CONFIRMED", 800000);
        order("SHIPPED", 700000);
        order("CANCELLED", 600000);
        UUID first = product(20, "ACTIVE");
        UUID second = product(20, "ACTIVE");
        for (UUID id : new UUID[] { first, second }) {
            jdbc.update("INSERT INTO order_item(id,order_id,product_id,quantity,price) VALUES(?,?,?,1,50000)",
                    UUID.randomUUID(), delivered, id);
        }
        jdbc.update("UPDATE product SET price = 250000 WHERE id = ?", first);
        var report = operations.summary();
        assertEquals(0, report.deliveredRevenue().compareTo(new BigDecimal("300000")));
        assertEquals(2, report.deliveredOrders());
        assertEquals(6, report.orderCounts().stream().mapToLong(item -> item.count()).sum());
        assertEquals(2, report.orderCounts().stream().filter(item -> item.status() == OrderStatus.DELIVERED).findFirst().orElseThrow().count());
    }

    @Test
    void lowStockIncludesZeroAndThresholdExcludesInactiveCatalogAndPaginates() {
        UUID empty = product(0, "ACTIVE");
        UUID threshold = product(5, "ACTIVE");
        product(6, "ACTIVE");
        product(1, "INACTIVE");
        UUID hidden = product(1, "ACTIVE");
        UUID hiddenCategory = UUID.randomUUID();
        jdbc.update("INSERT INTO category(id,name,slug,status) VALUES(?,?,?,'INACTIVE')",
                hiddenCategory, hiddenCategory.toString(), hiddenCategory.toString());
        jdbc.update("UPDATE product SET category_id = ? WHERE id = ?", hiddenCategory, hidden);
        assertEquals(2, operations.summary().lowStockProducts());
        var first = operations.lowStock(PageRequest.of(0, 1));
        var next = operations.lowStock(PageRequest.of(1, 1));
        assertEquals(2, first.getTotalElements());
        assertEquals(empty, first.getContent().get(0).id());
        assertEquals(threshold, next.getContent().get(0).id());
    }

    @Test
    void historyCapturesCreationAndTransitionsWithoutUnchangedStatusOrShipmentDuplicates() {
        UUID id = order("PENDING", 100000);
        UUID other = order("PENDING", 100000);
        jdbc.update("UPDATE orders SET status = 'CONFIRMED' WHERE id = ?", id);
        jdbc.update("UPDATE orders SET status = 'CONFIRMED', shipping_carrier = 'Test Carrier' WHERE id = ?", id);
        jdbc.update("UPDATE orders SET status = 'SHIPPED' WHERE id = ?", id);
        var latest = operations.history(id, PageRequest.of(0, 2));
        assertEquals(3, latest.getTotalElements());
        assertEquals(OrderStatus.SHIPPED, latest.getContent().get(0).toStatus());
        assertEquals(OrderStatus.CONFIRMED, latest.getContent().get(0).fromStatus());
        assertNotNull(latest.getContent().get(0).changedAt());
        var creation = operations.history(id, PageRequest.of(1, 2)).getContent().get(0);
        assertNull(creation.fromStatus());
        assertEquals(OrderStatus.PENDING, creation.toStatus());
        assertFalse(creation.baseline());
        assertEquals(1, operations.history(other, PageRequest.of(0, 20)).getTotalElements());
    }

    @Test
    void rolledBackTransitionLeavesNoHistoryRecord() {
        UUID id = order("PENDING", 100000);
        var transaction = new TransactionTemplate(transactionManager);
        transaction.executeWithoutResult(status -> {
            jdbc.update("UPDATE orders SET status = 'CONFIRMED' WHERE id = ?", id);
            status.setRollbackOnly();
        });
        var history = operations.history(id, PageRequest.of(0, 20));
        assertEquals(1, history.getTotalElements());
        assertEquals(OrderStatus.PENDING, history.getContent().get(0).toStatus());
    }

    @Test
    void concurrentConditionalTransitionCreatesOnlyOneHistoryEntry() throws Exception {
        UUID id = order("PENDING", 100000);
        var start = new CyclicBarrier(2);
        Callable<Integer> confirm = () -> {
            start.await(10, TimeUnit.SECONDS);
            return jdbc.update("UPDATE orders SET status = 'CONFIRMED' WHERE id = ? AND status = 'PENDING'", id);
        };
        var pool = Executors.newFixedThreadPool(2);
        try {
            var first = pool.submit(confirm);
            var second = pool.submit(confirm);
            assertEquals(Set.of(0, 1), Set.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS)));
        } finally {
            pool.shutdownNow();
        }
        assertEquals(2, operations.history(id, PageRequest.of(0, 20)).getTotalElements());
    }

    @Test
    void missingOrderReturnsNotFound() {
        assertThrows(ResourceNotFoundException.class,
                () -> operations.history(UUID.randomUUID(), PageRequest.of(0, 20)));
    }
}

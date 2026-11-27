package com.javaweb.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class OrderHistoryMigrationIT {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void upgradeKeepsLegacyOrderAndStartsWithAnExplicitBaseline() {
        var source = new DriverManagerDataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        Flyway.configure().dataSource(source).target("11").load().migrate();
        var jdbc = new JdbcTemplate(source);
        UUID user = UUID.randomUUID();
        UUID order = UUID.randomUUID();
        jdbc.update("INSERT INTO users(id,email,password,full_name) VALUES(?,?,?,?)",
                user, user + "@example.invalid", "unused-test-hash", "Legacy Customer");
        jdbc.update("""
                INSERT INTO orders(id,user_id,total_amount,status,payment_method,shipping_address,
                    phone_number,receiver_name,created_at,updated_at)
                VALUES(?,?,100000,'CONFIRMED','COD','Test address','0912345678','Legacy Customer',now(),now())
                """, order, user);
        Flyway.configure().dataSource(source).load().migrate();
        assertEquals("CONFIRMED", jdbc.queryForObject("SELECT status FROM orders WHERE id = ?", String.class, order));
        assertTrue(jdbc.queryForObject("""
                SELECT baseline AND from_status IS NULL AND to_status = 'CONFIRMED'
                FROM order_status_history WHERE order_id = ?
                """, Boolean.class, order));
        jdbc.update("UPDATE orders SET status = 'SHIPPED' WHERE id = ?", order);
        assertEquals(2, jdbc.queryForObject("SELECT count(*) FROM order_status_history WHERE order_id = ?", Integer.class, order));
        assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM order_status_history WHERE order_id = ? AND baseline", Integer.class, order));
    }
}

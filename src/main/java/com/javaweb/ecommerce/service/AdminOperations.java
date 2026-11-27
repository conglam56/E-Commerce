package com.javaweb.ecommerce.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse.LowStockProduct;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse.OrderCount;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse.StatusChange;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
public class AdminOperations {
    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final String LOW_STOCK_FILTER = """
             FROM product p JOIN category c ON c.id = p.category_id
             WHERE p.status = 'ACTIVE' AND c.status = 'ACTIVE' AND p.quantity <= ?
            """;
    private final JdbcTemplate jdbc;

    public AdminOperationsResponse summary() {
        var delivered = jdbc.queryForMap("""
                SELECT COALESCE(sum(total_amount), 0) AS revenue, count(*) AS orders
                FROM orders WHERE status = 'DELIVERED'
                """);
        long lowStock = jdbc.queryForObject("SELECT count(*)" + LOW_STOCK_FILTER, Long.class, LOW_STOCK_THRESHOLD);
        var counts = jdbc.query("SELECT status, count(*) AS total FROM orders GROUP BY status",
                (rs, row) -> new OrderCount(OrderStatus.valueOf(rs.getString("status")), rs.getLong("total")));
        return new AdminOperationsResponse((BigDecimal) delivered.get("revenue"),
                ((Number) delivered.get("orders")).longValue(), lowStock, LOW_STOCK_THRESHOLD, counts);
    }

    public Page<LowStockProduct> lowStock(Pageable pageable) {
        long count = jdbc.queryForObject("SELECT count(*)" + LOW_STOCK_FILTER, Long.class, LOW_STOCK_THRESHOLD);
        var products = jdbc.query("SELECT p.id, p.name, p.quantity" + LOW_STOCK_FILTER
                        + " ORDER BY p.quantity, p.name, p.id LIMIT ? OFFSET ?",
                (rs, row) -> new LowStockProduct(rs.getObject("id", UUID.class), rs.getString("name"), rs.getInt("quantity")),
                LOW_STOCK_THRESHOLD, pageable.getPageSize(), pageable.getOffset());
        return new PageImpl<>(products, pageable, count);
    }

    public Page<StatusChange> history(UUID orderId, Pageable pageable) {
        if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM orders WHERE id = ?)",
                Boolean.class, orderId))) throw new ResourceNotFoundException("Đơn hàng", orderId);
        long count = jdbc.queryForObject("SELECT count(*) FROM order_status_history WHERE order_id = ?", Long.class, orderId);
        var history = jdbc.query("""
                SELECT id, from_status, to_status, changed_at, baseline FROM order_status_history
                WHERE order_id = ? ORDER BY id DESC LIMIT ? OFFSET ?
                """, (rs, row) -> new StatusChange(rs.getLong("id"),
                rs.getString("from_status") == null ? null : OrderStatus.valueOf(rs.getString("from_status")),
                OrderStatus.valueOf(rs.getString("to_status")), rs.getObject("changed_at", OffsetDateTime.class),
                rs.getBoolean("baseline")), orderId, pageable.getPageSize(), pageable.getOffset());
        return new PageImpl<>(history, pageable, count);
    }
}

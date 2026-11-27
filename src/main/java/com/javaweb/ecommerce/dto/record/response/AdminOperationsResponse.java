package com.javaweb.ecommerce.dto.record.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import com.javaweb.ecommerce.entity.enums.OrderStatus;

public record AdminOperationsResponse(BigDecimal deliveredRevenue, long deliveredOrders,
        long lowStockProducts, int lowStockThreshold, List<OrderCount> orderCounts) {
    public record OrderCount(OrderStatus status, long count) {}
    public record LowStockProduct(UUID id, String name, int quantity) {}
    public record StatusChange(long id, OrderStatus fromStatus, OrderStatus toStatus,
            OffsetDateTime changedAt, boolean baseline) {}
}

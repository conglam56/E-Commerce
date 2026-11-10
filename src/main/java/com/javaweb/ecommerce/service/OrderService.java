package com.javaweb.ecommerce.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.javaweb.ecommerce.dto.record.request.CheckoutRequest;
import com.javaweb.ecommerce.dto.record.response.OrderResponse;
import com.javaweb.ecommerce.entity.enums.OrderStatus;

public interface OrderService {

    OrderResponse checkout(CheckoutRequest request);

    List<OrderResponse> getMyOrders();

    OrderResponse getOrderById(UUID orderId);

    OrderResponse cancelOrder(UUID orderId);

    Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);

    OrderResponse updateOrderStatus(UUID orderId, OrderStatus status);
}

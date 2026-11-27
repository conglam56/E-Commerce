package com.javaweb.ecommerce.controller;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.dto.record.response.OrderResponse;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.exception.InvalidOrderStateException;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;
import com.javaweb.ecommerce.mapper.OrderMapper;
import com.javaweb.ecommerce.repository.OrderRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class ShipmentController {
    private final OrderRepository orders;
    private final OrderMapper mapper;

    public record ShipmentRequest(@NotBlank @Size(max = 80) String carrier,
            @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{1,100}") String trackingNumber) {}

    @PutMapping("/{id}/shipment")
    @Transactional
    public ApiResponse<OrderResponse> update(@PathVariable UUID id, @Valid @RequestBody ShipmentRequest request) {
        var order = orders.findById(id).orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", id));
        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.SHIPPED)
            throw new InvalidOrderStateException("Chỉ cập nhật vận đơn cho đơn đã xác nhận hoặc đang giao.");
        order.setShippingCarrier(request.carrier().trim());
        order.setTrackingNumber(request.trackingNumber());
        orders.saveAndFlush(order);
        return ApiResponse.success(mapper.toResponse(order));
    }
}

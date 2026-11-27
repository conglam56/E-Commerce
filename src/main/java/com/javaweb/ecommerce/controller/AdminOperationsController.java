package com.javaweb.ecommerce.controller;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse.LowStockProduct;
import com.javaweb.ecommerce.dto.record.response.AdminOperationsResponse.StatusChange;
import com.javaweb.ecommerce.service.AdminOperations;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOperationsController {
    private final AdminOperations operations;

    @GetMapping("/operations")
    public ApiResponse<AdminOperationsResponse> summary() {
        return ApiResponse.success(operations.summary());
    }

    @GetMapping("/operations/low-stock")
    public ApiResponse<Page<LowStockProduct>> lowStock(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(operations.lowStock(pageRequest(page, size)));
    }

    @GetMapping("/orders/{id}/history")
    public ApiResponse<Page<StatusChange>> history(@PathVariable UUID id, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(operations.history(id, pageRequest(page, size)));
    }

    private PageRequest pageRequest(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Trang phải từ 0 và số dòng từ 1 đến 100.");
        return PageRequest.of(page, size);
    }
}

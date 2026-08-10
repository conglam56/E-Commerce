package com.javaweb.ecommerce.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.common.BaseController;
import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;
import com.javaweb.ecommerce.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController extends BaseController {
    private final ProductService productService;

    @GetMapping
    public ApiResponse<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return success(productService.getAllProducts(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable UUID id) {
        return success(productService.getProductById(id));
    }

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return success(productService.createProduct(productRequest));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable UUID id,
            @Valid @RequestBody ProductRequest productRequest) {
        return success(productService.updateProduct(id, productRequest));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return success("Product deleted successfully");
    }

}

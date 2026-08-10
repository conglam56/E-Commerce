package com.javaweb.ecommerce.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;

@Service
public interface ProductService {
    ProductResponse createProduct(ProductRequest product);

    ProductResponse updateProduct(UUID id, ProductRequest product);

    ProductResponse getProductById(UUID id);

    Page<ProductResponse> getAllProducts(Pageable pageable);

    void deleteProduct(UUID id);
}

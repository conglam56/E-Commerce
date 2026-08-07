package com.javaweb.ecommerce.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;

@Service
public interface ProductService {
    ProductResponse createProduct(ProductRequest product);
    ProductResponse updateProduct(UUID id, ProductRequest product);
    ProductResponse getProductById(UUID id);
    List<ProductResponse> getAllProducts();
    void deleteProduct(UUID id);
}

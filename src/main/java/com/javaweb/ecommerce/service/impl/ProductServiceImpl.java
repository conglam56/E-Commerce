package com.javaweb.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.enums.ProductStatus;
import com.javaweb.ecommerce.repository.CategoryRepository;
import com.javaweb.ecommerce.repository.ProductRepository;
import com.javaweb.ecommerce.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductRequest productRequest) {
        Product product = Product.builder()
                .name(productRequest.name())
                .quantity(productRequest.quantity())
                .description(productRequest.description())
                .imageUrl(productRequest.imageUrl())
                .price(productRequest.price())
                .category(categoryRepository.findById(productRequest.categoryId()).orElseThrow(
                        () -> new RuntimeException("Category not found with id: " + productRequest.categoryId())))
                .build();
        Product saved = productRepository.save(product);
        return ProductResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .quantity(saved.getQuantity())
                .description(saved.getDescription())
                .imageUrl(saved.getImageUrl())
                .price(saved.getPrice())
                .categoryName(saved.getCategory().getName())
                .build();
    }

    @Override
    public ProductResponse updateProduct(UUID id, ProductRequest productRequest) {
        Product product = productRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Product not found with id: " + id));

        product.setName(productRequest.name());
        product.setQuantity(productRequest.quantity());
        product.setDescription(productRequest.description());
        product.setImageUrl(productRequest.imageUrl());
        product.setPrice(productRequest.price());
        product.setCategory(categoryRepository.findById(productRequest.categoryId()).orElseThrow(
                () -> new RuntimeException("Category not found with id: " + productRequest.categoryId())));

        Product saved = productRepository.save(product);
        return ProductResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .quantity(saved.getQuantity())
                .description(saved.getDescription())
                .imageUrl(saved.getImageUrl())
                .price(saved.getPrice())
                .categoryName(saved.getCategory().getName())
                .build();
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .quantity(product.getQuantity())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .categoryName(product.getCategory().getName())
                .build();
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(product -> ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .quantity(product.getQuantity())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .categoryName(product.getCategory().getName())
                .build()).collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setStatus(ProductStatus.DELETED);
        productRepository.save(product);
    }
}

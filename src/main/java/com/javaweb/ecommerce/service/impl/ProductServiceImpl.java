package com.javaweb.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.enums.ProductStatus;
import com.javaweb.ecommerce.mapper.ProductMapper;
import com.javaweb.ecommerce.repository.CategoryRepository;
import com.javaweb.ecommerce.repository.ProductRepository;
import com.javaweb.ecommerce.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
        private final ProductRepository productRepository;
        private final CategoryRepository categoryRepository;
        private final ProductMapper productMapper;

        @Override
        public ProductResponse createProduct(ProductRequest productRequest) {
                Product product = productMapper.toProduct(productRequest);
                product.setCategory(categoryRepository.findById(productRequest.categoryId()).orElseThrow(
                                () -> new RuntimeException(
                                                "Category not found with id: " + productRequest.categoryId())));
                Product saved = productRepository.save(product);
                return productMapper.toProductResponse(saved);
        }

        @Override
        public ProductResponse updateProduct(UUID id, ProductRequest productRequest) {
                Product product = productRepository.findById(id).orElseThrow(
                                () -> new RuntimeException("Product not found with id: " + id));

                productMapper.updateProduct(productRequest, product);
                product.setCategory(categoryRepository.findById(productRequest.categoryId()).orElseThrow(
                                () -> new RuntimeException(
                                                "Category not found with id: " + productRequest.categoryId())));
                Product saved = productRepository.save(product);
                return productMapper.toProductResponse(saved);
        }

        @Override
        public ProductResponse getProductById(UUID id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
                return productMapper.toProductResponse(product);
        }

        @Override
        public Page<ProductResponse> getAllProducts(Pageable pageable) {
                Page<Product> products = productRepository.findAllProducts(pageable);
                return products.map(productMapper::toProductResponse);
        }

        @Override
        public void deleteProduct(UUID id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
                product.setStatus(ProductStatus.DELETED);
                productRepository.save(product);
        }
}

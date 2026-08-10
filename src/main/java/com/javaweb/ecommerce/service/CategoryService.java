package com.javaweb.ecommerce.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.CategoryRequest;
import com.javaweb.ecommerce.dto.record.response.CategoryResponse;

@Service
public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest categoryRequest);

    Page<CategoryResponse> getAllCategories(Pageable pageable);

    CategoryResponse getCategoryById(UUID id);

    CategoryResponse updateCategory(UUID id, CategoryRequest categoryRequest);

    void deleteCategory(UUID id);
}

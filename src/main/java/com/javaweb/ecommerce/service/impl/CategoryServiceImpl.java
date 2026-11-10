package com.javaweb.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.CategoryRequest;
import com.javaweb.ecommerce.dto.record.response.CategoryResponse;
import com.javaweb.ecommerce.entity.Category;
import com.javaweb.ecommerce.entity.enums.CategoryStatus;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;
import com.javaweb.ecommerce.mapper.CategoryMapper;
import com.javaweb.ecommerce.repository.CategoryRepository;
import com.javaweb.ecommerce.service.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

        private final CategoryRepository categoryRepository;
        private final CategoryMapper categoryMapper;

        @Override
        public CategoryResponse createCategory(CategoryRequest categoryRequest) {
                Category category = categoryMapper.toCategory(categoryRequest);
                Category saved = categoryRepository.save(category);
                return categoryMapper.toCategoryResponse(saved);
        }

        @Override
        public Page<CategoryResponse> getAllCategories(Pageable pageable) {
                Page<Category> categories = categoryRepository.findByStatus(CategoryStatus.ACTIVE, pageable);
                return categories.map(categoryMapper::toCategoryResponse);
        }

        @Override
        public CategoryResponse getCategoryById(UUID id) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
                return categoryMapper.toCategoryResponse(category);
        }

        @Override
        public CategoryResponse updateCategory(UUID id, CategoryRequest categoryRequest) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
                categoryMapper.updateCategory(categoryRequest, category);
                Category updated = categoryRepository.save(category);
                return categoryMapper.toCategoryResponse(updated);
        }

        @Override
        public void deleteCategory(UUID id) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
                category.setStatus(CategoryStatus.INACTIVE);
                categoryRepository.save(category);
        }
}

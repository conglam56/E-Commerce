package com.javaweb.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.CategoryRequest;
import com.javaweb.ecommerce.dto.record.response.CategoryResponse;
import com.javaweb.ecommerce.entity.Category;
import com.javaweb.ecommerce.entity.enums.CategoryStatus;
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
        public List<CategoryResponse> getAllCategories() {
                List<Category> categories = categoryRepository.findAll();
                return categories.stream()
                                .map(categoryMapper::toCategoryResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public CategoryResponse getCategoryById(UUID id) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
                return categoryMapper.toCategoryResponse(category);
        }

        @Override
        public CategoryResponse updateCategory(UUID id, CategoryRequest categoryRequest) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
                category.setName(categoryRequest.name());
                category.setSlug(categoryRequest.slug());
                Category updated = categoryRepository.save(category);
                return categoryMapper.toCategoryResponse(updated);
        }

        @Override
        public void deleteCategory(UUID id) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
                category.setStatus(CategoryStatus.INACTIVE);
                categoryRepository.save(category);
        }
}

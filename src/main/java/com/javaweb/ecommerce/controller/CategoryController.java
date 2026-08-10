package com.javaweb.ecommerce.controller;

import org.springframework.web.bind.annotation.RestController;

import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.common.BaseController;
import com.javaweb.ecommerce.dto.record.request.CategoryRequest;
import com.javaweb.ecommerce.dto.record.response.CategoryResponse;
import com.javaweb.ecommerce.service.CategoryService;

import jakarta.validation.Valid;

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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController extends BaseController {
    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return success(categoryService.getAllCategories(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable UUID id) {
        return success(categoryService.getCategoryById(id));
    }

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        return success(categoryService.createCategory(categoryRequest));
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable UUID id,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        return success(categoryService.updateCategory(id, categoryRequest));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return success("Category deleted successfully");
    }
}

package com.javaweb.ecommerce.controller;

import org.springframework.web.bind.annotation.RestController;

import com.javaweb.ecommerce.service.CategoryService;

import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
}

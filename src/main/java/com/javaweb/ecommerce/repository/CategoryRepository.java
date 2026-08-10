package com.javaweb.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.Category;
import com.javaweb.ecommerce.entity.enums.CategoryStatus;

import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Page<Category> findByStatus(CategoryStatus status, Pageable pageable);

}

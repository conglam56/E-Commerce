package com.javaweb.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.Product;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query(value = "SELECT p FROM Product p JOIN FETCH p.category c WHERE c.status = 'ACTIVE' AND p.status = 'ACTIVE'", countQuery = "SELECT COUNT(p.id) FROM Product p JOIN p.category c WHERE c.status = 'ACTIVE' AND p.status = 'ACTIVE'")
    Page<Product> findAllProducts(Pageable pageable);
}
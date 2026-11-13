package com.javaweb.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.Product;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    String CATALOG_FILTER = """
             WHERE c.status = 'ACTIVE' AND p.status = 'ACTIVE'
               AND c.id = COALESCE(:categoryId, c.id)
               AND (LOWER(p.name) LIKE LOWER(:pattern) ESCAPE '!'
                    OR LOWER(p.description) LIKE LOWER(:pattern) ESCAPE '!')
            """;

    @Query(value = "SELECT p FROM Product p JOIN FETCH p.category c" + CATALOG_FILTER,
            countQuery = "SELECT COUNT(p.id) FROM Product p JOIN p.category c" + CATALOG_FILTER)
    Page<Product> findAllProducts(@Param("categoryId") UUID categoryId, @Param("pattern") String pattern,
            Pageable pageable);
}

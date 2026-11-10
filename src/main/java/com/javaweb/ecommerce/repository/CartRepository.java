package com.javaweb.ecommerce.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    @EntityGraph(attributePaths = { "items", "items.product" })
    Optional<Cart> findByUser_Id(UUID userId);
}

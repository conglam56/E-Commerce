package com.javaweb.ecommerce.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @EntityGraph(attributePaths = { "items", "items.product", "user" })
    Optional<Order> findWithDetailsById(UUID id);

    @EntityGraph(attributePaths = { "items", "items.product" })
    List<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = { "items", "items.product", "user" })
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "items", "items.product", "user" })
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}


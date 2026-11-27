package com.javaweb.ecommerce.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findLockedById(UUID id);

    @Query("select o.id from Order o where o.paymentMethod = com.javaweb.ecommerce.entity.enums.PaymentMethod.VNPAY"
            + " and o.paymentStatus = com.javaweb.ecommerce.entity.enums.PaymentStatus.UNPAID"
            + " and o.status = com.javaweb.ecommerce.entity.enums.OrderStatus.PENDING"
            + " and o.paymentExpiresAt <= :now order by o.id")
    List<UUID> findExpiredPaymentIds(LocalDateTime now, Pageable pageable);

    @EntityGraph(attributePaths = { "items", "items.product", "user" })
    Optional<Order> findWithDetailsById(UUID id);

    @EntityGraph(attributePaths = { "items", "items.product" })
    List<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = { "user" })
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "user" })
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}


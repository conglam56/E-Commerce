package com.javaweb.ecommerce.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javaweb.ecommerce.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Modifying
    @Query(value = "UPDATE users SET password = :newHash, reset_hash = NULL, reset_expires = NULL "
            + "WHERE id = :id AND password = :currentHash AND status = 'ACTIVE'", nativeQuery = true)
    int updatePassword(@Param("id") UUID id, @Param("currentHash") String currentHash,
            @Param("newHash") String newHash);
}

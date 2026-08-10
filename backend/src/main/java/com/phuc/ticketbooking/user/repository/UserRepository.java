package com.phuc.ticketbooking.user.repository;

import com.phuc.ticketbooking.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    Page<User> findAllByDeletedAtIsNull(Pageable pageable);

    /**
     * Loads a user with roles and each role's permissions in a single JOIN FETCH query.
     * Use this when authorities need to be resolved (JWT filter cache miss, login, OAuth2).
     */
    @Query("""
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.roles r
            LEFT JOIN FETCH r.permissions
            WHERE u.id = :id AND u.deletedAt IS NULL
            """)
    Optional<User> findByIdWithRolesAndPermissions(@Param("id") UUID id);

    /**
     * Same as above but by email — used during login (CustomUserDetailsService).
     */
    @Query("""
            SELECT DISTINCT u FROM User u
            LEFT JOIN FETCH u.roles r
            LEFT JOIN FETCH r.permissions
            WHERE u.email = :email AND u.deletedAt IS NULL
            """)
    Optional<User> findByEmailWithRolesAndPermissions(@Param("email") String email);
}

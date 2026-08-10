package com.phuc.ticketbooking.user.service.domain;

import com.phuc.ticketbooking.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Domain Service for User.
 * Handles direct repository access and core domain logic.
 * Only this layer may inject {@link com.phuc.ticketbooking.user.repository.UserRepository}.
 */
public interface UserDomainService {

    User findActiveUserById(UUID userId);

    /**
     * Loads user with roles + permissions eagerly via JOIN FETCH.
     * Use for security context population (JWT filter cache miss, login).
     */
    User findActiveUserByIdWithRolesAndPermissions(UUID userId);

    User findActiveUserByEmail(String email);

    /**
     * Loads user by email with roles + permissions eagerly.
     * Used by {@code CustomUserDetailsService} during login.
     */
    User findActiveUserByEmailWithRolesAndPermissions(String email);

    boolean existsActiveUserByEmail(String email);

    User save(User user);

    Page<User> findAllActive(Pageable pageable);
}

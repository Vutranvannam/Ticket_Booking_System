package com.phuc.ticketbooking.user.service.domain.impl;

import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.repository.UserRepository;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDomainServiceImpl implements UserDomainService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public User findActiveUserById(UUID userId) {
        return userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * Finds an active (non-deleted) user by ID, eagerly fetching roles and permissions.
     *
     * <p>The {@code deletedAt IS NULL} filter is enforced inside the JPQL query in
     * {@link com.phuc.ticketbooking.user.repository.UserRepository#findByIdWithRolesAndPermissions},
     * so deleted users are excluded at the database level.
     */
    @Override
    @Transactional(readOnly = true)
    public User findActiveUserByIdWithRolesAndPermissions(UUID userId) {
        return userRepository.findByIdWithRolesAndPermissions(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public User findActiveUserByEmail(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public User findActiveUserByEmailWithRolesAndPermissions(String email) {
        return userRepository.findByEmailWithRolesAndPermissions(email)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsActiveUserByEmail(String email) {
        return userRepository.existsByEmailAndDeletedAtIsNull(email);
    }

    @Override
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> findAllActive(Pageable pageable) {
        return userRepository.findAllByDeletedAtIsNull(pageable);
    }
}

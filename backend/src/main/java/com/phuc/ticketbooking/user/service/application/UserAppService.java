package com.phuc.ticketbooking.user.service.application;

import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.user.dto.request.UpdateProfileRequest;
import com.phuc.ticketbooking.user.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Application Service for User module.
 * Orchestrates use cases and maps domain entities to DTOs.
 */
public interface UserAppService {

    UserResponse getMe(UUID userId);

    UserResponse updateMe(UUID userId, UpdateProfileRequest request);

    PageResponse<UserResponse> listUsers(Pageable pageable);
}

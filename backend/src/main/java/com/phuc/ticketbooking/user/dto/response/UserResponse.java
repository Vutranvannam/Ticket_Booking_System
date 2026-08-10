package com.phuc.ticketbooking.user.dto.response;

import java.util.Set;
import java.util.UUID;

/**
 * Safe projection of a User — never exposes passwordHash.
 */
public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String phone,
        String avatarUrl,
        boolean isEmailVerified,
        Set<String> roles,
        Set<String> permissions
) {
}

package com.phuc.ticketbooking.user.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Request body for {@code PUT /users/me}.
 * All fields are optional — null means "don't change".
 */
public record UpdateProfileRequest(

        @Size(max = 150, message = "Full name must not exceed 150 characters")
        String fullName,

        @Size(max = 20, message = "Phone must not exceed 20 characters")
        String phone,

        @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
        String avatarUrl
) {
}

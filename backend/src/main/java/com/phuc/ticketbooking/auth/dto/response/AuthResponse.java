package com.phuc.ticketbooking.auth.dto.response;

import com.phuc.ticketbooking.user.dto.response.UserResponse;

public record AuthResponse(
        String accessToken,
        long expiresIn,
        UserResponse user
) {
}

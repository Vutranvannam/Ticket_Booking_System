package com.phuc.ticketbooking.auth.dto;

import com.phuc.ticketbooking.user.dto.response.UserResponse;

public record TokenPair(
        String accessToken,
        String refreshToken,
        long expiresIn,
        long refreshTokenExpiresIn,
        UserResponse user
) {
}

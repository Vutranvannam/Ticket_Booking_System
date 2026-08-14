package com.phuc.ticketbooking.auth.dto.response;

public record RefreshResponse(
        String accessToken,
        long expiresIn
) {
}
package com.phuc.ticketbooking.auth.dto.response;

/**
 * Response body for POST /auth/forgot-password.
 *
 * @param message          User-facing status message
 * @param expiresInSeconds Remaining TTL of the OTP in seconds
 */
public record ForgotPasswordResponse(
        String message,
        int expiresInSeconds
) {
}

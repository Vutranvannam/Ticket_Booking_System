package com.phuc.ticketbooking.auth.dto.response;

/**
 * Generic response body for issuing a reset token.
 * This is used for both POST /auth/verify-reset-otp and POST /auth/verify-old-password.
 *
 * @param resetToken       One-time reset token to be used in the next step
 * @param expiresInSeconds TTL of the reset token in seconds
 */
public record ResetTokenResponse(
        String resetToken,
        int expiresInSeconds
) {
}

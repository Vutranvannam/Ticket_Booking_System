package com.phuc.ticketbooking.auth.security.payload;

import java.util.UUID;

/**
 * Parsed payload of a refresh token.
 * securityStamp allows detecting security events (password change, force-logout)
 * that should invalidate the refresh token.
 * sessionId ties the refresh token to a specific login session.
 */
public record RefreshTokenPayload(
        UUID userId,
        UUID sessionId,
        long securityStamp
) {
}

package com.phuc.ticketbooking.auth.security.payload;

import java.util.UUID;

/**
 * Parsed payload of an access token.
 * Carries userId, sessionId, securityStamp, and permissionVersion
 * for the 3-layer invalidation check.
 */
public record AccessTokenPayload(
        UUID userId,
        UUID sessionId,
        long securityStamp,
        long permissionVersion
) {
}

package com.phuc.ticketbooking.auth.dto.response;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for an active login session.
 * Used by the "active sessions" endpoint.
 */
public record SessionResponse(
        UUID sessionId,
        Instant loginAt,
        Instant lastAccessAt,
        String ip,
        String userAgent,
        String deviceName,
        boolean currentSession
) {
}

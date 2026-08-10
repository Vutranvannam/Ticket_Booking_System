package com.phuc.ticketbooking.auth.cache;

import java.time.Instant;
import java.util.UUID;

/**
 * Cached session metadata for an active login session.
 * Redis key: {@code session:{userId}:{sessionId}}
 * <p>
 * Each login creates a new session. The session exists in Redis
 * for the lifetime of the refresh token. When deleted (logout),
 * the JWT filter will reject any access token carrying this session ID.
 */
public record SessionCache(
        UUID sessionId,
        Instant loginAt,
        Instant lastAccessAt,
        String ip,
        String userAgent,
        String deviceName
) {
}

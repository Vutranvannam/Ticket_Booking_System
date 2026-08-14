package com.phuc.ticketbooking.auth.cache;

import com.phuc.ticketbooking.common.util.SHA256Hasher;
import com.phuc.ticketbooking.common.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Manages refresh token storage in Redis.
 *
 * <p>Strategy: only the SHA-256 hash of the raw token is stored, keyed per-session.
 * <pre>
 *   Key:   refresh:{userId}:{sessionId}
 *   Value: SHA256(rawRefreshToken)
 *   TTL:   refreshTokenExpiry (seconds)
 * </pre>
 *
 * <p>Each session has exactly one refresh token, enabling multi-device support.
 * There is no separate index for refresh tokens -- the session index
 * ({@code user:sessions:{userId}}) owned by {@link SessionCacheService} is the
 * single source of truth for active sessions. Given a {@code sessionId} from the
 * index, the refresh key is derived deterministically.
 *
 * <p><b>Revocation</b>: single-session and all-session revocation is handled
 * atomically by {@link AuthRevocationService} via Lua scripts. This service only
 * handles storage and validation.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenCacheService {

    /** Prefix for refresh token keys: {@code refresh:{userId}:{sessionId}} */
    static final String REFRESH_PREFIX = "refresh:";

    private final StringRedisTemplate stringRedisTemplate;

    private final AppProperties appProperties;

    // -- Write -----------------------------------------------------------------

    /**
     * Stores the SHA-256 hash of a new refresh token for a specific session.
     * TTL = refresh token expiry.
     */
    public void store(UUID userId, UUID sessionId, String rawToken) {
        String key  = refreshKey(userId, sessionId);
        String hash = SHA256Hasher.hash(rawToken);
        stringRedisTemplate.opsForValue().set(key, hash, Duration.ofSeconds(appProperties.jwt().refreshTokenExpiry()));
    }

    // -- Read ------------------------------------------------------------------

    /**
     * Returns {@code true} if the raw token matches the stored hash for this session.
     * Returns {@code false} if the key does not exist (session revoked or expired).
     */
    public boolean validate(UUID userId, UUID sessionId, String rawToken) {
        String stored = stringRedisTemplate.opsForValue().get(refreshKey(userId, sessionId));
        if (stored == null) return false;
        return stored.equals(SHA256Hasher.hash(rawToken));
    }

    // -- Package-access key builder (used by AuthRevocationService) ------------

    /**
     * Builds the refresh token key: {@code refresh:{userId}:{sessionId}}.
     * Package-private -- only {@link AuthRevocationService} uses this externally.
     */
    static String refreshKey(UUID userId, UUID sessionId) {
        return REFRESH_PREFIX + userId + ":" + sessionId;
    }
}
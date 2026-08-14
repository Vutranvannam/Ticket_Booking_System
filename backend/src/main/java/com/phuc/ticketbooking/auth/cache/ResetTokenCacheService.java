package com.phuc.ticketbooking.auth.cache;

import com.phuc.ticketbooking.common.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * Manages the one-time-use reset token cache entries in Redis.
 *
 * <p>Key: {@code reset:token:{UUID-token}} → email (String), TTL 15 min
 *
 * <p>The token is consumed on first use — {@link #getAndDelete} atomically
 * reads the email and removes the key, preventing replay attacks.
 */
@Service
@RequiredArgsConstructor
public class ResetTokenCacheService {

    private static final String TOKEN_KEY_PREFIX = "reset:token:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final AppProperties appProperties;

    /**
     * Stores a mapping of {@code token → email} with a 15-minute TTL.
     */
    public void store(String token, String email) {
        redisTemplate.opsForValue().set(tokenKey(token), email, Duration.ofSeconds(appProperties.resetToken().expirySeconds()));
    }

    /**
     * One-time use: retrieves the email associated with the token and immediately
     * deletes the key. Returns {@link Optional#empty()} if the token is not found
     * or already consumed.
     */
    public Optional<String> getAndDelete(String token) {
        String key = tokenKey(token);
        Object value = redisTemplate.opsForValue().getAndDelete(key);
        return Optional.ofNullable(value).map(Object::toString);
    }

    /**
     * Returns {@code true} if the token exists (is still valid and unused).
     */
    public boolean exists(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(tokenKey(token)));
    }

    // ── Key builder ───────────────────────────────────────────────────────────

    private String tokenKey(String token) {
        return TOKEN_KEY_PREFIX + token;
    }
}

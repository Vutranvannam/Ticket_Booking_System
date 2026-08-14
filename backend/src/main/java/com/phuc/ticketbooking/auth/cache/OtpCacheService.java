package com.phuc.ticketbooking.auth.cache;

import com.phuc.ticketbooking.common.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * Manages OTP-related cache entries in Redis for the forgot-password flow.
 *
 * <p>Keys:
 * <ul>
 *   <li>{@code otp:forgot:{email}}    — SHA-256 hash of the OTP, TTL 5 min</li>
 *   <li>{@code otp:attempts:{email}}  — attempt counter (int as String), TTL 5 min</li>
 *   <li>{@code otp:cooldown:{email}}  — resend cooldown flag, TTL 60 s</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class OtpCacheService {

    private static final String OTP_KEY_PREFIX       = "otp:forgot:";
    private static final String ATTEMPTS_KEY_PREFIX  = "otp:attempts:";
    private static final String COOLDOWN_KEY_PREFIX  = "otp:cooldown:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final AppProperties appProperties;

    // ── OTP hash ──────────────────────────────────────────────────────────────

    /**
     * Stores the SHA-256 hash of the OTP for the given email with a 5-minute TTL.
     */
    public void store(String email, String otpHash) {
        redisTemplate.opsForValue().set(otpKey(email), otpHash, Duration.ofSeconds(appProperties.otp().expirySeconds()));
    }

    /**
     * Returns the stored OTP hash if present (non-expired).
     */
    public Optional<String> getHash(String email) {
        Object value = redisTemplate.opsForValue().get(otpKey(email));
        return Optional.ofNullable(value).map(Object::toString);
    }

    /**
     * Deletes the OTP hash AND the attempt counter for the given email.
     * Call after successful verification, or on rollback when publish fails.
     */
    public void delete(String email) {
        redisTemplate.delete(otpKey(email));
        redisTemplate.delete(attemptsKey(email));
    }

    // ── Attempt counter ───────────────────────────────────────────────────────

    /**
     * Increments the failed attempt counter, setting TTL on first increment.
     * Returns the new count after incrementing.
     */
    public long incrementAttempts(String email) {
        String key = attemptsKey(email);
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            // First increment — set TTL aligned with OTP expiry
            redisTemplate.expire(key, Duration.ofSeconds(appProperties.otp().expirySeconds()));
        }
        return count != null ? count : 1L;
    }

    /**
     * Returns the current attempt count (0 if key does not exist).
     */
    public int getAttempts(String email) {
        Object value = redisTemplate.opsForValue().get(attemptsKey(email));
        if (value == null) return 0;
        return Integer.parseInt(value.toString());
    }

    // ── Cooldown (resend rate-limit) ──────────────────────────────────────────

    /**
     * Returns {@code true} if a resend cooldown is active for the email.
     */
    public boolean isCoolingDown(String email) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey(email)));
    }

    /**
     * Sets a 60-second resend cooldown for the email.
     * Must be called AFTER a successful RabbitMQ publish.
     */
    public void setCooldown(String email) {
        redisTemplate.opsForValue().set(cooldownKey(email), "1", Duration.ofSeconds(appProperties.otp().cooldownSeconds()));
    }

    // ── Key builders ──────────────────────────────────────────────────────────

    private String otpKey(String email) {
        return OTP_KEY_PREFIX + email.toLowerCase();
    }

    private String attemptsKey(String email) {
        return ATTEMPTS_KEY_PREFIX + email.toLowerCase();
    }

    private String cooldownKey(String email) {
        return COOLDOWN_KEY_PREFIX + email.toLowerCase();
    }
}

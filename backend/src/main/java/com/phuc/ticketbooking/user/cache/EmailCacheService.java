package com.phuc.ticketbooking.user.cache;

import com.phuc.ticketbooking.common.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Exact-membership cache: the Redis SET {@code emails:active} contains
 * <em>exactly</em> the lower-cased email of every active (non-deleted) user.
 *
 * <h3>Invariant</h3>
 * <ul>
 *   <li>{@link #add} is called after a user is created or restored.</li>
 *   <li>{@link #remove} is called immediately on soft-delete.</li>
 *   <li>On email change: {@link #remove} old email, then {@link #add} new email.</li>
 * </ul>
 *
 * <p>Because the invariant is maintained, membership is conclusive:
 * <ul>
 *   <li>{@link #exists} returns {@code true}  → email is in use, no DB check needed.</li>
 *   <li>{@link #exists} returns {@code false} → email is free <em>or</em> cache is cold
 *       (first start-up / Redis eviction) → DB check required.</li>
 * </ul>
 *
 * <pre>
 *   Key:   emails:active
 *   Type:  SET
 *   TTL:   24h (auto-renewed on write)
 * </pre>
 */
@Service
@RequiredArgsConstructor
public class EmailCacheService {

    private static final String CACHE_KEY = "emails:active";

    private final StringRedisTemplate stringRedisTemplate;
    private final AppProperties appProperties;

    /**
     * Returns {@code true} if the email is present in the active-email set.
     * <p>
     * A {@code true} result is conclusive — the email belongs to an active user;
     * the caller should reject the request immediately without querying the DB.
     * <br>
     * A {@code false} result means the email is absent from the cache (definitely
     * free, or the cache is cold) — a DB check is still required.
     */
    public boolean exists(String email) {
        Boolean result = stringRedisTemplate.opsForSet().isMember(CACHE_KEY, normalise(email));
        return Boolean.TRUE.equals(result);
    }

    /**
     * Adds an email to the active set (called after successful user creation).
     */
    public void add(String email) {
        stringRedisTemplate.opsForSet().add(CACHE_KEY, normalise(email));
        stringRedisTemplate.expire(CACHE_KEY, Duration.ofHours(appProperties.cache().emailTtlHours()));
    }

    /**
     * Removes an email from the active set (called on soft-delete or email change).
     */
    public void remove(String email) {
        stringRedisTemplate.opsForSet().remove(CACHE_KEY, normalise(email));
    }

    private String normalise(String email) {
        return email.toLowerCase().trim();
    }
}

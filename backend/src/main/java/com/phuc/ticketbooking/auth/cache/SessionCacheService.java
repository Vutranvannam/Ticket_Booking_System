package com.phuc.ticketbooking.auth.cache;

import com.phuc.ticketbooking.common.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Manages active login sessions in Redis.
 *
 * <pre>
 *   Index: user:sessions:{userId}          Redis Set of bare sessionId strings
 *          TTL = refresh-token-expiry (bumped on every store)
 *
 *   Data:  session:{userId}:{sessionId}    String to SessionCache (JSON)
 *          TTL = refresh-token-expiry
 * </pre>
 *
 * <p>The index stores bare {@code sessionId} UUID strings (not full keys). Given a
 * {@code sessionId}, both the session data key and the refresh-token key can be
 * derived without scanning or pattern-matching.
 *
 * <p><b>Serialization note</b>: the index Set uses {@link StringRedisTemplate} so
 * members are stored as plain UTF-8 strings. This allows the Lua scripts in
 * {@link AuthRevocationService} to concatenate bare session IDs into full key names
 * without stripping JSON quotes.
 *
 * <p><b>Revocation</b>: single-session and all-session revocation is handled
 * atomically by {@link AuthRevocationService} via Lua scripts. This service only
 * handles creation and reads.
 */
@Service
@RequiredArgsConstructor
public class SessionCacheService {

    /** Prefix for session data keys: {@code session:{userId}:{sessionId}} */
    static final String SESSION_PREFIX = "session:";

    /** Prefix for the per-user session index: {@code user:sessions:{userId}} */
    static final String USER_SESSIONS_PREFIX = "user:sessions:";

    /** JSON-serializing template -- used for session data values (SessionCache). */
    private final RedisTemplate<String, Object> redisTemplate;

    /** Plain-string template -- used for the index Set (bare sessionId members). */
    private final StringRedisTemplate stringRedisTemplate;

    private final AppProperties appProperties;

    // -- Write -----------------------------------------------------------------

    /**
     * Stores a new session with TTL = refresh token expiry.
     * Adds the bare {@code sessionId} UUID string to the user's session index Set.
     * Bumps the index TTL so it always outlives the longest-lived session.
     */
    public void store(UUID userId, SessionCache session) {
        String sessionKey = sessionKey(userId, session.sessionId());
        String indexKey   = userSessionsKey(userId);
        Duration ttl      = Duration.ofSeconds(appProperties.jwt().refreshTokenExpiry());

        // Store session data as JSON
        redisTemplate.opsForValue().set(sessionKey, session, ttl);

        // Register bare sessionId in the index (plain string -- no JSON wrapping)
        stringRedisTemplate.opsForSet().add(indexKey, session.sessionId().toString());
        // Bump index TTL so it outlives the longest-lived session in the Set
        stringRedisTemplate.expire(indexKey, ttl);
    }

    // -- Read ------------------------------------------------------------------

    /**
     * Gets session metadata. Returns {@code null} if the session does not exist
     * (logged out or TTL expired).
     */
    public SessionCache get(UUID userId, UUID sessionId) {
        return (SessionCache) redisTemplate.opsForValue().get(sessionKey(userId, sessionId));
    }

    /**
     * Checks if a session exists -- O(1) key existence check used by the JWT filter
     * on every authenticated request.
     */
    public boolean exists(UUID userId, UUID sessionId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(sessionKey(userId, sessionId)));
    }

    /**
     * Returns all active sessions for a user.
     *
     * <p>Reads bare sessionIds from the index Set (SMEMBERS user:sessions:{userId}),
     * then fetches each session by its data key. Sessions whose TTL has already
     * expired are pruned from the index lazily via SREM.
     */
    public Set<SessionCache> getAllSessions(UUID userId) {
        String indexKey = userSessionsKey(userId);
        Set<String> members = stringRedisTemplate.opsForSet().members(indexKey);
        Set<SessionCache> sessions = new HashSet<>();
        if (members == null) return sessions;

        for (String sidStr : members) {
            UUID sessionId = UUID.fromString(sidStr);
            SessionCache session = get(userId, sessionId);
            if (session != null) {
                sessions.add(session);
            } else {
                // Session TTL expired -- prune stale sessionId from the index lazily
                stringRedisTemplate.opsForSet().remove(indexKey, sidStr);
            }
        }
        return sessions;
    }

    // -- Package-access key builders (used by AuthRevocationService) -----------

    /**
     * Builds the session data key: {@code session:{userId}:{sessionId}}.
     * Package-private -- only {@link AuthRevocationService} uses this externally.
     */
    static String sessionKey(UUID userId, UUID sessionId) {
        return SESSION_PREFIX + userId + ":" + sessionId;
    }

    /**
     * Builds the user session index key: {@code user:sessions:{userId}}.
     * Package-private -- only {@link AuthRevocationService} uses this.
     */
    static String userSessionsKey(UUID userId) {
        return USER_SESSIONS_PREFIX + userId;
    }
}
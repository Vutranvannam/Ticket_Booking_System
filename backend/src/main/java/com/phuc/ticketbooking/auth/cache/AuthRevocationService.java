package com.phuc.ticketbooking.auth.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Orchestrates atomic session and refresh-token revocation via Redis Lua scripts.
 *
 * <pre>
 *   AuthAppServiceImpl
 *         |
 *         v
 *   AuthRevocationService  (Lua scripts -- single Redis execution)
 *         |
 *         v
 *     Redis (atomic)
 * </pre>
 *
 * <p><b>Why Lua and not MULTI/EXEC?</b><br>
 * {@code revokeAll} must first read {@code SMEMBERS} to discover session IDs, then
 * delete all derived keys. {@code MULTI/EXEC} queues commands without returning
 * intermediate results, so the SMEMBERS result is unavailable inside the transaction.
 * A Lua script executes atomically on the Redis server: the read and subsequent
 * deletes happen in one uninterruptible step -- no other client can interleave.
 *
 * <p><b>Serialization</b>: uses {@link StringRedisTemplate} so KEYS and ARGV arrays
 * are passed as plain UTF-8 strings, consistent with how the session index members
 * are stored ({@link SessionCacheService} uses StringRedisTemplate for the index Set).
 * Session data keys use StringRedisSerializer in both templates.
 *
 * <p><b>Idempotency</b>: {@code DEL} on a missing key and {@code SREM} of a missing
 * member are both no-ops in Redis, making concurrent revoke calls safe.
 */
@Service
@RequiredArgsConstructor
public class AuthRevocationService {

    private final StringRedisTemplate stringRedisTemplate;

    // -- Lua Scripts -----------------------------------------------------------

    /**
     * Atomically revokes a single session:
     * <ol>
     *   <li>DEL {@code session:{userId}:{sessionId}}</li>
     *   <li>DEL {@code refresh:{userId}:{sessionId}}</li>
     *   <li>SREM {@code sessionId} from {@code user:sessions:{userId}}</li>
     * </ol>
     *
     * <pre>
     * KEYS[1] = session:{userId}:{sessionId}
     * KEYS[2] = refresh:{userId}:{sessionId}
     * KEYS[3] = user:sessions:{userId}
     * ARGV[1] = sessionId (bare UUID string)
     * </pre>
     */
    private static final RedisScript<Long> REVOKE_SESSION_SCRIPT =
            RedisScript.of(new ClassPathResource("scripts/revoke_session.lua"), Long.class);

    /**
     * Atomically revokes all sessions for a user:
     * <ol>
     *   <li>SMEMBERS {@code user:sessions:{userId}} to get all session IDs</li>
     *   <li>DEL every {@code session:{userId}:{sid}} and {@code refresh:{userId}:{sid}}</li>
     *   <li>DEL the index key itself</li>
     * </ol>
     *
     * <pre>
     * KEYS[1] = user:sessions:{userId}
     * ARGV[1] = session key prefix, e.g. "session:{userId}:"
     * ARGV[2] = refresh key prefix, e.g. "refresh:{userId}:"
     * </pre>
     */
    private static final RedisScript<Long> REVOKE_ALL_SCRIPT =
            RedisScript.of(new ClassPathResource("scripts/revoke_all_sessions.lua"), Long.class);

    // -- Public API ------------------------------------------------------------

    /**
     * Atomically revokes a single session and its associated refresh token.
     *
     * <p>Concurrent calls for the same session are safe: DEL and SREM are idempotent.
     * If the session key has already expired by TTL, DEL is a no-op; SREM removes
     * the stale index entry as a bonus cleanup.
     *
     * @param userId    the user who owns the session
     * @param sessionId the session to revoke
     */
    public void revokeSession(UUID userId, UUID sessionId) {
        String sessionKey = SessionCacheService.sessionKey(userId, sessionId);
        String refreshKey = RefreshTokenCacheService.refreshKey(userId, sessionId);
        String indexKey   = SessionCacheService.userSessionsKey(userId);

        stringRedisTemplate.execute(
                REVOKE_SESSION_SCRIPT,
                List.of(sessionKey, refreshKey, indexKey),
                sessionId.toString()
        );
    }

    /**
     * Atomically revokes all sessions and refresh tokens for a user.
     *
     * <p>The Lua script reads SMEMBERS inside an atomic execution context, so no
     * session created concurrently after SMEMBERS is read can be accidentally revoked.
     * Sessions created after this call starts will survive.
     *
     * <p>If the application crashes after the DB {@code securityStamp} bump but before
     * this method runs, version-based invalidation in the JWT filter (stamp mismatch)
     * ensures all old tokens are rejected. Redis cleanup then happens lazily via TTL.
     *
     * @param userId the user whose sessions should be revoked
     */
    public void revokeAll(UUID userId) {
        String indexKey      = SessionCacheService.userSessionsKey(userId);
        String sessionPrefix = SessionCacheService.SESSION_PREFIX + userId + ":";
        String refreshPrefix = RefreshTokenCacheService.REFRESH_PREFIX + userId + ":";

        stringRedisTemplate.execute(
                REVOKE_ALL_SCRIPT,
                List.of(indexKey),
                sessionPrefix,
                refreshPrefix
        );
    }
}
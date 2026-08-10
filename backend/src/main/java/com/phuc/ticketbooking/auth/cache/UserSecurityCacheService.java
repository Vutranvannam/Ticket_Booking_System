package com.phuc.ticketbooking.auth.cache;

import com.phuc.ticketbooking.user.entity.Role;
import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Manages the {@link UserSecurityCache} in Redis.
 * <p>
 * Single cache type:
 * <ul>
 * <li><b>user_security</b> {@code us:{userId}} — full security profile
 * including
 * securityStamp, permissionVersion, and pre-built authorities.
 * Used by the JWT filter for version validation and SecurityContext
 * population.</li>
 * </ul>
 * <p>
 * When the cache misses, this service loads the user from DB via
 * {@link UserDomainService}
 * and populates the cache automatically.
 */
@Service
@RequiredArgsConstructor
public class UserSecurityCacheService {

    private static final String SECURITY_KEY_PREFIX = "us:";
    private static final Duration SECURITY_TTL = Duration.ofHours(1);

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserDomainService userDomainService;

    // ── UserSecurityCache ─────────────────────────────────────────────────────

    /**
     * Gets the cached security profile for a user.
     * Returns null on cache miss — caller should use
     * {@link #getOrLoadUserSecurityCache(UUID)}.
     */
    public UserSecurityCache getUserSecurityCache(UUID userId) {
        String key = securityKey(userId);
        return (UserSecurityCache) redisTemplate.opsForValue().get(key);
    }

    /**
     * Gets the cached security profile, loading from DB on cache miss.
     * This is the preferred method for the JWT filter.
     */
    public UserSecurityCache getOrLoadUserSecurityCache(UUID userId) {
        UserSecurityCache cache = getUserSecurityCache(userId);
        if (cache != null) {
            return cache;
        }

        // Cache miss — load from DB and populate
        User user = userDomainService.findActiveUserByIdWithRolesAndPermissions(userId);
        cache = buildSecurityCache(user);
        putUserSecurityCache(userId, cache);
        return cache;
    }

    /**
     * Stores the security cache for a user entity (typically after login/register).
     */
    public void putUserSecurityCache(User user) {
        UserSecurityCache cache = buildSecurityCache(user);
        putUserSecurityCache(user.getId(), cache);
    }

    /**
     * Evicts the security cache for a user.
     * Must be called when securityStamp or permissionVersion changes.
     */
    public void evictUserSecurityCache(UUID userId) {
        redisTemplate.delete(securityKey(userId));
    }

    // ── Key Builder ───────────────────────────────────────────────────────────

    private String securityKey(UUID userId) {
        return SECURITY_KEY_PREFIX + userId;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private void putUserSecurityCache(UUID userId, UserSecurityCache cache) {
        String key = securityKey(userId);
        redisTemplate.opsForValue().set(key, cache, SECURITY_TTL);
    }

    private UserSecurityCache buildSecurityCache(User user) {
        Set<String> authorities = user.getRoles() == null
                ? Set.of()
                : user.getRoles().stream()
                        .flatMap(role -> Stream.concat(
                                Stream.of("ROLE_" + role.getName()),
                                permissionsOf(role)))
                        .collect(Collectors.toSet());

        return new UserSecurityCache(
                user.getId(),
                user.getEmail(),
                user.isLocked(),
                authorities,
                user.getSecurityStamp(),
                user.getPermissionVersion());
    }

    private Stream<String> permissionsOf(Role role) {
        if (role.getPermissions() == null)
            return Stream.empty();
        return role.getPermissions().stream().map(p -> p.getCode());
    }
}

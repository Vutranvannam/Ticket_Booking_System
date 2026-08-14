package com.phuc.ticketbooking.auth.cache;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Cached security profile for a user.
 * Redis key: {@code us:{userId}}
 * <p>
 * Contains version stamps for fast mismatch detection in the JWT filter,
 * plus pre-built authorities so no DB query is needed on the hot path.
 * <p>
 * When {@code securityStamp} or {@code permissionVersion} changes,
 * the cache must be explicitly evicted via {@link UserSecurityCacheService#evictUserSecurityCache(UUID)}.
 */

public record UserSecurityCache(
        UUID userId,
        String email,
        boolean locked,
        Set<String> authorities,
        long securityStamp,
        long permissionVersion
) {

    /**
     * Returns Spring Security {@link GrantedAuthority} collection built from
     * the cached authority strings (ROLE_xxx + permission codes).
     * <p>
     * Excluded from JSON serialization — this is a computed view of {@code authorities}
     * and cannot be deserialized back (no setter/constructor param).
     */
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getGrantedAuthorities() {
        return authorities.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
}

package com.phuc.ticketbooking.auth.service.application;

import com.phuc.ticketbooking.auth.cache.UserSecurityCache;

import java.util.UUID;

/**
 * Dedicated Application Service for the Security layer.
 * Used primarily by JwtAuthenticationFilter to load the security profile without causing
 * circular dependencies or violating cross-module architecture rules.
 */
public interface AuthSecurityAppService {

    /**
     * Gets the cached security profile, loading from DB on cache miss.
     */
    UserSecurityCache getOrLoadSecurityProfile(UUID userId);
}

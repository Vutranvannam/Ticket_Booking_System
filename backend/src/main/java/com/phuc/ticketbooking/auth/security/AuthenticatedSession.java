package com.phuc.ticketbooking.auth.security;

import com.phuc.ticketbooking.auth.cache.UserSecurityCache;

import java.util.UUID;

/**
 * Combines cached user security info with the current session ID.
 * <p>
 * Set as the {@code Authentication.principal} in {@code SecurityContext}
 * by {@link JwtAuthenticationFilter}. This allows controllers to access
 * both user security data and the session ID from the authenticated principal.
 * <p>
 * Usage in controllers:
 * <pre>{@code
 * @AuthenticationPrincipal AuthenticatedSession session
 * session.userId()      // user's UUID
 * session.sessionId()   // current session UUID
 * }</pre>
 */
public record AuthenticatedSession(
        UserSecurityCache userSecurity,
        UUID sessionId
) {

    public UUID userId() {
        return userSecurity.userId();
    }

    public String email() {
        return userSecurity.email();
    }
}

package com.phuc.ticketbooking.auth.security;

import com.phuc.ticketbooking.auth.cache.SessionCacheService;
import com.phuc.ticketbooking.auth.cache.UserSecurityCache;
import com.phuc.ticketbooking.auth.cache.UserSecurityCacheService;
import com.phuc.ticketbooking.auth.security.payload.AccessTokenPayload;
import com.phuc.ticketbooking.common.constant.AppConstants;
import com.phuc.ticketbooking.common.exception.ApiException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * JWT authentication filter — 3-layer invalidation.
 * <p>
 * Per-request flow (2 Redis GETs on the hot path):
 * <ol>
 * <li>Extract Bearer token from {@code Authorization} header.</li>
 * <li>Parse {@link AccessTokenPayload} — validates signature and expiry.</li>
 * <li><b>GET 1</b> — Fetch {@link UserSecurityCache} from Redis
 * ({@code us:{userId}}).
 * On cache miss, auto-loads from DB.
 * <ul>
 * <li>Compare {@code securityStamp} — mismatch → reject (security event).</li>
 * <li>Compare {@code permissionVersion} — mismatch → reject (permissions
 * outdated).</li>
 * <li>Check {@code locked} — true → reject.</li>
 * </ul>
 * </li>
 * <li><b>GET 2</b> — Check session exists
 * ({@code session:{userId}:{sessionId}}).
 * Not found → reject (logged out).</li>
 * <li>Set {@link SecurityContextHolder} with {@link AuthenticatedSession} as
 * principal.</li>
 * </ol>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserSecurityCacheService userSecurityCacheService;
    private final SessionCacheService sessionCacheService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);
        if (!StringUtils.hasText(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            AccessTokenPayload payload = jwtTokenProvider.parseAccessToken(token);
            UUID userId = payload.userId();
            UUID sessionId = payload.sessionId();

            // ── Step 1: Get security cache (auto-loads from DB on miss) ───
            UserSecurityCache securityCache = userSecurityCacheService.getOrLoadUserSecurityCache(userId);

            // ── Step 2: Version validation ────────────────────────────────
            if (payload.securityStamp() != securityCache.securityStamp()) {
                // Security event occurred (password change, force-logout, account lock)
                filterChain.doFilter(request, response);
                return;
            }

            if (payload.permissionVersion() != securityCache.permissionVersion()) {
                // Permissions have changed — client should refresh the access token
                filterChain.doFilter(request, response);
                return;
            }

            if (securityCache.locked()) {
                filterChain.doFilter(request, response);
                return;
            }

            // ── Step 3: Session existence check ───────────────────────────
            if (!sessionCacheService.exists(userId, sessionId)) {
                // Session has been revoked (logged out from this device)
                filterChain.doFilter(request, response);
                return;
            }

            // ── Step 4: Set SecurityContext ───────────────────────────────
            AuthenticatedSession authenticatedSession = new AuthenticatedSession(securityCache, sessionId);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    authenticatedSession,
                    null,
                    securityCache.getGrantedAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ApiException ex) {
            SecurityContextHolder.clearContext();
            // Invalid/expired token — let Spring Security handle the 401
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(AppConstants.JWT_HEADER);
        if (StringUtils.hasText(header) && header.startsWith(AppConstants.JWT_PREFIX)) {
            return header.substring(AppConstants.JWT_PREFIX.length());
        }
        return null;
    }
}

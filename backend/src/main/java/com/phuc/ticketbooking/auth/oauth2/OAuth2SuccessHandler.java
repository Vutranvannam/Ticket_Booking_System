package com.phuc.ticketbooking.auth.oauth2;

import com.phuc.ticketbooking.auth.cache.RefreshTokenCacheService;
import com.phuc.ticketbooking.auth.cache.SessionCache;
import com.phuc.ticketbooking.auth.cache.SessionCacheService;
import com.phuc.ticketbooking.auth.cache.UserSecurityCacheService;
import com.phuc.ticketbooking.auth.security.JwtTokenProvider;
import com.phuc.ticketbooking.common.util.RequestUtils;
import com.phuc.ticketbooking.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

/**
 * Handles successful OAuth2 Google authentication.
 *
 * <p>Flow:
 * <ol>
 *   <li>Create a new session (sessionId, metadata).</li>
 *   <li>Generate a refresh token (with sessionId). No access token is generated here.</li>
 *   <li>Store session and refresh token hash in Redis.</li>
 *   <li>Warm up the security cache.</li>
 *   <li>Set refresh token as an HttpOnly cookie (path = /api/auth/refresh).</li>
 *   <li>Redirect to the configured frontend success URL (clean URL, no token).</li>
 * </ol>
 *
 * <p>The frontend then calls {@code POST /api/auth/refresh} (cookie sent automatically)
 * to receive an access token, and {@code GET /api/users/me} to retrieve user info.
 * The access token never appears in any URL.
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenCacheService refreshTokenCacheService;
    private final SessionCacheService sessionCacheService;
    private final UserSecurityCacheService userSecurityCacheService;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpirySeconds;

    /** Frontend URL to redirect to after successful OAuth2 login. */
    @Value("${app.oauth2.redirect-uri}")
    private String frontendSuccessUrl;

    /**
     * When {@code true}, the refresh-token cookie carries the {@code Secure} flag
     * (required for HTTPS in staging/production). Defaults to {@code false} for
     * local HTTP development.
     */
    @Value("${app.security.cookie-secure:false}")
    private boolean cookieSecure;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        User user = principal.getUser();

        UUID sessionId = UUID.randomUUID();

        // Only a refresh token is generated here.
        // The access token will be issued later by POST /api/auth/refresh.
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), sessionId, user.getSecurityStamp());

        // Store session metadata in Redis
        SessionCache session = new SessionCache(
                sessionId,
                Instant.now(),
                Instant.now(),
                RequestUtils.extractIp(request),
                RequestUtils.extractUserAgent(request),
                RequestUtils.extractDeviceName(request));
        sessionCacheService.store(user.getId(), session);

        // Store refresh token hash in Redis (per-session)
        refreshTokenCacheService.store(user.getId(), sessionId, refreshToken);

        // Warm up security cache
        userSecurityCacheService.putUserSecurityCache(user);

        // Set HttpOnly refresh token cookie — frontend uses this to call /api/auth/refresh
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth/refresh")
                .maxAge(refreshTokenExpirySeconds)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        clearAuthenticationAttributes(request);

        // Redirect to frontend success page — no token in URL.
        // Frontend calls POST /api/auth/refresh to obtain an access token,
        // then GET /api/users/me for the user profile.
        getRedirectStrategy().sendRedirect(request, response, frontendSuccessUrl);
    }
}
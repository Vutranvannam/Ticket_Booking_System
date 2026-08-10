package com.phuc.ticketbooking.auth.service.application.impl;

import com.phuc.ticketbooking.auth.cache.AuthRevocationService;
import com.phuc.ticketbooking.auth.cache.RefreshTokenCacheService;
import com.phuc.ticketbooking.auth.cache.SessionCache;
import com.phuc.ticketbooking.auth.cache.SessionCacheService;
import com.phuc.ticketbooking.auth.cache.UserSecurityCacheService;
import com.phuc.ticketbooking.auth.dto.TokenPair;
import com.phuc.ticketbooking.auth.dto.request.LoginRequest;
import com.phuc.ticketbooking.auth.dto.request.RegisterRequest;
import com.phuc.ticketbooking.auth.dto.response.SessionResponse;
import com.phuc.ticketbooking.auth.security.CustomUserDetails;
import com.phuc.ticketbooking.auth.security.JwtTokenProvider;
import com.phuc.ticketbooking.auth.security.payload.RefreshTokenPayload;
import com.phuc.ticketbooking.auth.service.application.AuthAppService;
import com.phuc.ticketbooking.common.constant.AppConstants;
import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import com.phuc.ticketbooking.common.util.RequestUtils;
import com.phuc.ticketbooking.user.cache.EmailCacheService;
import com.phuc.ticketbooking.user.entity.Role;
import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.mapper.UserMapper;
import com.phuc.ticketbooking.user.service.domain.RoleDomainService;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthAppServiceImpl implements AuthAppService {

    private final UserDomainService userDomainService;
    private final RoleDomainService roleDomainService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final RefreshTokenCacheService refreshTokenCacheService;
    private final UserSecurityCacheService userSecurityCacheService;
    private final SessionCacheService sessionCacheService;
    private final AuthenticationManager authenticationManager;
    private final EmailCacheService emailCacheService;
    private final AuthRevocationService authRevocationService;

    @Override
    public TokenPair register(RegisterRequest request, HttpServletRequest httpRequest) {
        // Fast duplicate check via exact-membership cache.
        // Cache hit → email is in use, reject immediately (no DB query needed).
        if (emailCacheService.exists(request.email())) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Cache miss → cache is cold or this is first start-up; fall back to DB.
        if (userDomainService.existsActiveUserByEmail(request.email())) {
            emailCacheService.add(request.email()); // warm cache for next attempt
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // ── DB phase ────────────────────────────────────────────────────
        // Each domain service call manages its own @Transactional scope,
        // so save() commits before we proceed to Redis writes below.
        Role customerRole = roleDomainService.findByName(AppConstants.CUSTOMER_ROLE);

        User user = User.createNew(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.fullName(),
                request.phone());
        user.addRole(customerRole);
        user = userDomainService.save(user); // commits immediately

        // ── Cache phase ─────────────────────────────────────────────────
        emailCacheService.add(request.email());

        // Reload with roles+permissions (needed for security cache population)
        user = userDomainService.findActiveUserByIdWithRolesAndPermissions(user.getId());

        // ── Redis phase (session + refresh token + security cache) ─────────────
        return buildTokenPair(user, httpRequest);
    }

    @Override
    public TokenPair login(LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));

            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            UUID userId = principal.getUserId();

            // ── DB phase ────────────────────────────────────────────────────
            // Reload with roles+permissions; save() commits before Redis writes.
            User user = userDomainService.findActiveUserByIdWithRolesAndPermissions(userId);
            user.recordLogin();
            user = userDomainService.save(user); // commits immediately

            // ── Redis phase (session + refresh token + security cache) ─────────────
            return buildTokenPair(user, httpRequest);

        } catch (AuthenticationException ex) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    @Override
    public TokenPair refresh(String rawRefreshToken) {
        RefreshTokenPayload payload = jwtTokenProvider.parseRefreshToken(rawRefreshToken);
        UUID userId = payload.userId();
        UUID sessionId = payload.sessionId();

        // Validate securityStamp — detects password change or force-logout
        // Uses getOrLoad which auto-warms the security cache on miss
        User user = userDomainService.findActiveUserByIdWithRolesAndPermissions(userId);
        if (payload.securityStamp() != user.getSecurityStamp()) {
            throw new ApiException(ErrorCode.TOKEN_INVALID, "Refresh token is no longer valid");
        }

        // Validate session exists in Redis
        if (!sessionCacheService.exists(userId, sessionId)) {
            throw new ApiException(ErrorCode.TOKEN_INVALID, "Session has been revoked");
        }

        // Validate refresh token hash against Redis
        if (!refreshTokenCacheService.validate(userId, sessionId, rawRefreshToken)) {
            throw new ApiException(ErrorCode.TOKEN_INVALID, "Refresh token has been revoked or does not exist");
        }

        // Generate new access token only (no refresh token rotation)
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), sessionId, user.getSecurityStamp(), user.getPermissionVersion());

        // Re-warm security cache with latest user data
        userSecurityCacheService.putUserSecurityCache(user);

        return new TokenPair(
                newAccessToken,
                rawRefreshToken, // same refresh token
                jwtTokenProvider.getAccessTokenExpirySeconds(),
                userMapper.toResponse(user));
    }

    @Override
    public void logout(UUID userId, UUID sessionId) {
        // Atomically revoke this session and its refresh token via Lua script.
        // No DB update, no version bump — other sessions are unaffected.
        authRevocationService.revokeSession(userId, sessionId);
    }

    @Override
    public void logoutAll(UUID userId) {
        // Bump securityStamp to invalidate ALL existing tokens across all devices.
        // userDomainService.save() carries its own @Transactional, so the DB commit
        // happens before the Redis revoke call below.
        // Even if Redis cleanup fails, the securityStamp mismatch in the JWT filter
        // ensures all old tokens are rejected immediately.
        User user = userDomainService.findActiveUserById(userId);
        user.increaseSecurityStamp();
        userDomainService.save(user); // commits immediately

        // Atomically revoke all sessions + refresh tokens via Lua script.
        // Lua reads SMEMBERS and deletes all derived keys in one atomic execution.
        authRevocationService.revokeAll(userId);

        // Evict security cache so the filter picks up the new securityStamp
        userSecurityCacheService.evictUserSecurityCache(userId);
    }

    @Override
    public List<SessionResponse> getActiveSessions(UUID userId, UUID currentSessionId) {
        Set<SessionCache> sessions = sessionCacheService.getAllSessions(userId);
        return sessions.stream()
                .map(session -> new SessionResponse(
                        session.sessionId(),
                        session.loginAt(),
                        session.lastAccessAt(),
                        session.ip(),
                        session.userAgent(),
                        session.deviceName(),
                        session.sessionId().equals(currentSessionId)))
                .sorted(Comparator.comparing(SessionResponse::loginAt).reversed())
                .toList();
    }

    @Override
    public void revokeSession(UUID userId, UUID sessionId) {
        if (!sessionCacheService.exists(userId, sessionId)) {
            throw new ApiException(ErrorCode.SESSION_NOT_FOUND);
        }
        // Atomically revoke this session and its refresh token via Lua script.
        authRevocationService.revokeSession(userId, sessionId);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private TokenPair buildTokenPair(User user, HttpServletRequest httpRequest) {
        UUID sessionId = UUID.randomUUID();

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), sessionId, user.getSecurityStamp(), user.getPermissionVersion());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), sessionId, user.getSecurityStamp());

        // Store session metadata in Redis
        SessionCache session = new SessionCache(
                sessionId,
                Instant.now(),
                Instant.now(),
                RequestUtils.extractIp(httpRequest),
                RequestUtils.extractUserAgent(httpRequest),
                RequestUtils.extractDeviceName(httpRequest));
        sessionCacheService.store(user.getId(), session);

        // Store refresh token hash in Redis (per-session)
        refreshTokenCacheService.store(user.getId(), sessionId, refreshToken);

        // Warm up security cache
        userSecurityCacheService.putUserSecurityCache(user);

        return new TokenPair(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirySeconds(),
                userMapper.toResponse(user));
    }
}

package com.phuc.ticketbooking.auth.security;

import com.phuc.ticketbooking.auth.security.payload.AccessTokenPayload;
import com.phuc.ticketbooking.auth.security.payload.RefreshTokenPayload;
import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.phuc.ticketbooking.common.config.AppProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Generates and validates JWT access and refresh tokens.
 * <p>
 * Access token claims:
 * <ul>
 *   <li>{@code sub}   — user UUID</li>
 *   <li>{@code type}  — "access"</li>
 *   <li>{@code sid}   — session UUID</li>
 *   <li>{@code ss}    — securityStamp</li>
 *   <li>{@code pv}    — permissionVersion</li>
 * </ul>
 * Refresh token claims:
 * <ul>
 *   <li>{@code sub}   — user UUID</li>
 *   <li>{@code type}  — "refresh"</li>
 *   <li>{@code sid}   — session UUID</li>
 *   <li>{@code ss}    — securityStamp (to detect security events)</li>
 * </ul>
 */
@Component
public class JwtTokenProvider {

    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_SID  = "sid";  // session ID
    private static final String CLAIM_SS   = "ss";   // securityStamp
    private static final String CLAIM_PV   = "pv";   // permissionVersion
    private static final String TYPE_ACCESS  = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final SecretKey secretKey;
    private final long accessTokenExpirySeconds;
    private final long refreshTokenExpirySeconds;

    public JwtTokenProvider(AppProperties appProperties) {
        this.secretKey = Keys.hmacShaKeyFor(appProperties.jwt().secret().getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirySeconds = appProperties.jwt().accessTokenExpiry();
        this.refreshTokenExpirySeconds = appProperties.jwt().refreshTokenExpiry();
    }

    // ── Token Generation ──────────────────────────────────────────────────────

    public String generateAccessToken(UUID userId, UUID sessionId, long securityStamp, long permissionVersion) {
        long nowMs = System.currentTimeMillis();
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_TYPE, TYPE_ACCESS)
                .claim(CLAIM_SID, sessionId.toString())
                .claim(CLAIM_SS, securityStamp)
                .claim(CLAIM_PV, permissionVersion)
                .issuedAt(new Date(nowMs))
                .expiration(new Date(nowMs + accessTokenExpirySeconds * 1_000))
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(UUID userId, UUID sessionId, long securityStamp) {
        long nowMs = System.currentTimeMillis();
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_TYPE, TYPE_REFRESH)
                .claim(CLAIM_SID, sessionId.toString())
                .claim(CLAIM_SS, securityStamp)
                .issuedAt(new Date(nowMs))
                .expiration(new Date(nowMs + refreshTokenExpirySeconds * 1_000))
                .signWith(secretKey)
                .compact();
    }

    // ── Token Parsing ─────────────────────────────────────────────────────────

    /**
     * Parses an access token and returns its payload.
     *
     * @throws ApiException TOKEN_EXPIRED or TOKEN_INVALID
     */
    public AccessTokenPayload parseAccessToken(String token) {
        Claims claims = parseClaims(token);
        if (!TYPE_ACCESS.equals(claims.get(CLAIM_TYPE))) {
            throw new ApiException(ErrorCode.TOKEN_INVALID, "Not an access token");
        }
        return new AccessTokenPayload(
                UUID.fromString(claims.getSubject()),
                UUID.fromString(claims.get(CLAIM_SID, String.class)),
                claims.get(CLAIM_SS, Long.class),
                claims.get(CLAIM_PV, Long.class)
        );
    }

    /**
     * Parses a refresh token and returns its payload.
     *
     * @throws ApiException TOKEN_EXPIRED or TOKEN_INVALID
     */
    public RefreshTokenPayload parseRefreshToken(String token) {
        Claims claims = parseClaims(token);
        if (!TYPE_REFRESH.equals(claims.get(CLAIM_TYPE))) {
            throw new ApiException(ErrorCode.TOKEN_INVALID, "Not a refresh token");
        }
        return new RefreshTokenPayload(
                UUID.fromString(claims.getSubject()),
                UUID.fromString(claims.get(CLAIM_SID, String.class)),
                claims.get(CLAIM_SS, Long.class)
        );
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            throw new ApiException(ErrorCode.TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ApiException(ErrorCode.TOKEN_INVALID);
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public long getAccessTokenExpirySeconds() {
        return accessTokenExpirySeconds;
    }

    public long getRefreshTokenExpirySeconds() {
        return refreshTokenExpirySeconds;
    }
}

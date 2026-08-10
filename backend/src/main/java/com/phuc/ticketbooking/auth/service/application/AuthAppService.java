package com.phuc.ticketbooking.auth.service.application;

import com.phuc.ticketbooking.auth.dto.TokenPair;
import com.phuc.ticketbooking.auth.dto.request.LoginRequest;
import com.phuc.ticketbooking.auth.dto.request.RegisterRequest;
import com.phuc.ticketbooking.auth.dto.response.SessionResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.UUID;

/**
 * Application Service for Authentication.
 * Orchestrates user domain logic, JWT generation, session management, and cache management.
 */
public interface AuthAppService {

    TokenPair register(RegisterRequest request, HttpServletRequest httpRequest);

    TokenPair login(LoginRequest request, HttpServletRequest httpRequest);

    /**
     * Exchanges a valid refresh token for a new access token.
     * Does NOT rotate the refresh token or create a new session.
     */
    TokenPair refresh(String refreshToken);

    /**
     * Logs out a single session — revokes the session and its refresh token from Redis.
     * Does NOT bump securityStamp — other sessions are unaffected.
     */
    void logout(UUID userId, UUID sessionId);

    /**
     * Logs out all sessions — bumps securityStamp and revokes all sessions
     * and refresh tokens from Redis. User must re-login on all devices.
     */
    void logoutAll(UUID userId);

    /**
     * Returns all active sessions for the authenticated user.
     */
    List<SessionResponse> getActiveSessions(UUID userId, UUID currentSessionId);

    /**
     * Revokes a specific session (remote logout from another device).
     */
    void revokeSession(UUID userId, UUID sessionId);
}

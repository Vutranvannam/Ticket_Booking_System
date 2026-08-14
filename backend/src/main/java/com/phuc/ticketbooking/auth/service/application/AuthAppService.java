package com.phuc.ticketbooking.auth.service.application;

import com.phuc.ticketbooking.auth.dto.TokenPair;
import com.phuc.ticketbooking.auth.dto.request.ForgotPasswordRequest;
import com.phuc.ticketbooking.auth.dto.request.LoginRequest;
import com.phuc.ticketbooking.auth.dto.request.RegisterRequest;
import com.phuc.ticketbooking.auth.dto.request.ResetPasswordRequest;
import com.phuc.ticketbooking.auth.dto.request.VerifyOldPasswordRequest;
import com.phuc.ticketbooking.auth.dto.request.VerifyResetOtpRequest;
import com.phuc.ticketbooking.auth.dto.response.ForgotPasswordResponse;
import com.phuc.ticketbooking.auth.dto.response.SessionResponse;
import com.phuc.ticketbooking.auth.dto.response.ResetTokenResponse;
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

    /**
     * Step 1: Generates a 6-digit OTP, stores its SHA-256 hash in Redis (TTL 5 min),
     * and publishes an async email event via RabbitMQ.
     *
     * <p>Silent on unknown emails (anti-enumeration).
     */
    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    /**
     * Step 2: Verifies the OTP (SHA-256 comparison) and, on success,
     * returns a one-time reset token (UUID, TTL 15 min) stored in Redis.
     */
    ResetTokenResponse verifyResetOtp(VerifyResetOtpRequest request);

    /**
     * Verifies the old password of an authenticated user.
     * On success, returns a one-time reset token (UUID, TTL 15 min) stored in Redis.
     */
    ResetTokenResponse verifyOldPassword(UUID userId, VerifyOldPasswordRequest request);

    /**
     * Step 3: Validates the reset token, changes the user's password,
     * bumps securityStamp, and revokes all active sessions.
     */
    void resetPassword(ResetPasswordRequest request);
}

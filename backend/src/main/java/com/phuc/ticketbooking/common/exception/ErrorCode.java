package com.phuc.ticketbooking.common.exception;

import lombok.Getter;

/**
 * Enum defining all application error codes.
 * <p>
 * Grouped by HTTP status for clarity. Each module can reference
 * existing codes or request new ones to be added here.
 */
@Getter
public enum ErrorCode {

    // ── 400 Bad Request ──
    VALIDATION_FAILED(400, "VALIDATION_FAILED", "Validation failed"),
    INVALID_REQUEST(400, "INVALID_REQUEST", "Invalid request"),
    OTP_INVALID(400, "OTP_INVALID", "OTP is invalid or expired"),
    RESET_TOKEN_INVALID(400, "RESET_TOKEN_INVALID", "Reset token is invalid or expired"),

    // ── 401 Unauthorized ──
    UNAUTHORIZED(401, "UNAUTHORIZED", "Authentication required"),
    INVALID_CREDENTIALS(401, "INVALID_CREDENTIALS", "Invalid email or password"),
    TOKEN_EXPIRED(401, "TOKEN_EXPIRED", "Token has expired"),
    TOKEN_INVALID(401, "TOKEN_INVALID", "Token is invalid"),
    TOKEN_PERMISSION_OUTDATED(401, "TOKEN_PERMISSION_OUTDATED", "Token permissions are outdated"),

    // ── 403 Forbidden ──
    ACCESS_DENIED(403, "ACCESS_DENIED", "Access denied"),

    // ── 404 Not Found ──
    RESOURCE_NOT_FOUND(404, "RESOURCE_NOT_FOUND", "Resource not found"),
    USER_NOT_FOUND(404, "USER_NOT_FOUND", "User not found"),
    SESSION_NOT_FOUND(404, "SESSION_NOT_FOUND", "Session not found"),

    // ── 409 Conflict ──
    DUPLICATE_RESOURCE(409, "DUPLICATE_RESOURCE", "Resource already exists"),
    EMAIL_ALREADY_EXISTS(409, "EMAIL_ALREADY_EXISTS", "Email already exists"),

    // ── 429 Too Many Requests ──
    OTP_MAX_ATTEMPTS(429, "OTP_MAX_ATTEMPTS", "Too many OTP attempts, please request a new OTP"),
    OTP_RESEND_TOO_SOON(429, "OTP_RESEND_TOO_SOON", "Please wait before requesting a new OTP"),

    // ── 500 Internal Server Error ──
    INTERNAL_ERROR(500, "INTERNAL_ERROR", "An unexpected error occurred"),
    EMAIL_QUEUE_UNAVAILABLE(500, "EMAIL_QUEUE_UNAVAILABLE", "Unable to queue email at this time, please try again");

    private final int status;
    private final String code;
    private final String message;

    ErrorCode(int status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}

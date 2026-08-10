package com.phuc.ticketbooking.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error response body returned by all API error responses.
 *
 * <pre>
 * {
 *   "status": 400,
 *   "code": "VALIDATION_FAILED",
 *   "message": "Email already exists",
 *   "timestamp": "2026-08-01T23:00:00Z",
 *   "path": "/api/auth/register",
 *   "errors": { "email": "must not be blank" }
 * }
 * </pre>
 */
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        int status,
        String code,
        String message,
        Instant timestamp,
        String path,
        Map<String, String> errors
) {

    public static ErrorResponse of(ErrorCode errorCode, String path) {
        return ErrorResponse.builder()
                .status(errorCode.getStatus())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(Instant.now())
                .path(path)
                .build();
    }

    public static ErrorResponse of(ErrorCode errorCode, String message, String path) {
        return ErrorResponse.builder()
                .status(errorCode.getStatus())
                .code(errorCode.getCode())
                .message(message)
                .timestamp(Instant.now())
                .path(path)
                .build();
    }
}

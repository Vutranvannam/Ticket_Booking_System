package com.phuc.ticketbooking.common.exception;

import lombok.Getter;

/**
 * Base exception for all application-specific exceptions.
 * <p>
 * Carries an {@link ErrorCode} so the {@link GlobalExceptionHandler}
 * can produce a consistent {@link ErrorResponse}.
 */
@Getter
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ApiException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ApiException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}

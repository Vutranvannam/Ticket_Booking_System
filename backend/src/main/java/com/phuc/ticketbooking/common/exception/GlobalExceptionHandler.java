package com.phuc.ticketbooking.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler that translates exceptions into consistent
 * {@link ErrorResponse} bodies.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles all {@link ApiException} subclasses (ResourceNotFoundException,
     * DuplicateResourceException, UnauthorizedException, etc.).
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(
            ApiException ex, HttpServletRequest request) {

        ErrorCode errorCode = ex.getErrorCode();

        log.warn("API exception [{}]: {}", errorCode.getCode(), ex.getMessage());

        ErrorResponse response = ErrorResponse.of(errorCode, ex.getMessage(), request.getRequestURI());

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    /**
     * Handles Bean Validation errors from {@code @Valid} request bodies.
     * Collects per-field error messages into the {@code errors} map.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .code(ErrorCode.VALIDATION_FAILED.getCode())
                .message("Validation failed")
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .errors(fieldErrors)
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    /**
     * Catch-all for any unhandled exception.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.of(
                ErrorCode.INTERNAL_ERROR, request.getRequestURI());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}

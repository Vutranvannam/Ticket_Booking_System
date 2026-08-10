package com.phuc.ticketbooking.common.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

/**
 * Utility methods for extracting common metadata from HTTP requests.
 * Centralises IP, User-Agent and device-name extraction so that multiple
 * components (AuthAppServiceImpl, OAuth2SuccessHandler, etc.) share one
 * implementation without copy-paste.
 */
public final class RequestUtils {

    private RequestUtils() {}

    /**
     * Extracts the client IP address.
     * Respects the {@code X-Forwarded-For} header set by reverse proxies;
     * falls back to {@link HttpServletRequest#getRemoteAddr()} otherwise.
     */
    public static String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Returns the {@code User-Agent} header value, or {@code "Unknown"} if absent.
     */
    public static String extractUserAgent(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        return ua != null ? ua : "Unknown";
    }

    /**
     * Infers a human-readable device name from the User-Agent string.
     * Returns one of: {@code "Mobile"}, {@code "Tablet"}, {@code "Desktop"}.
     */
    public static String extractDeviceName(HttpServletRequest request) {
        String ua = extractUserAgent(request);
        if (ua.contains("Mobile")) return "Mobile";
        if (ua.contains("Tablet")) return "Tablet";
        return "Desktop";
    }
}
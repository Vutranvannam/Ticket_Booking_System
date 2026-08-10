package com.phuc.ticketbooking.common.constant;

/**
 * Application-wide constants.
 */
public final class AppConstants {

    private AppConstants() {
    }

    // ── JWT ──
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";

    // ── Roles ──
    public static final String CUSTOMER_ROLE   = "CUSTOMER";
    public static final String ORGANIZER_ROLE  = "ORGANIZER";
    public static final String ADMIN_ROLE      = "ADMIN";
    public static final String SUPER_ADMIN_ROLE = "SUPER_ADMIN";
}

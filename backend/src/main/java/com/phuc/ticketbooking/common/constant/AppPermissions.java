package com.phuc.ticketbooking.common.constant;

/**
 * Permission code constants for {@code @PreAuthorize} expressions.
 * <p>
 * Each constant must <b>exactly match</b> the {@code code} column
 * in the {@code permissions} table.
 * <p>
 * Usage in controllers:
 * <pre>
 * import static com.phuc.ticketbooking.common.constant.AppPermissions.USER_LIST;
 *
 * &#64;PreAuthorize("hasAuthority('" + USER_LIST + "')")
 * </pre>
 */
public final class AppPermissions {

    private AppPermissions() {
    }

    // ── User module ──────────────────────────────────────────────────────────
    public static final String USER_LIST   = "USER_LIST";
    public static final String USER_VIEW   = "USER_VIEW";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_DELETE = "USER_DELETE";

    // ── Venue module ─────────────────────────────────────────────────────────
    public static final String VENUE_LIST   = "VENUE_LIST";
    public static final String VENUE_VIEW   = "VENUE_VIEW";
    public static final String VENUE_CREATE = "VENUE_CREATE";
    public static final String VENUE_UPDATE = "VENUE_UPDATE";
    public static final String VENUE_DELETE = "VENUE_DELETE";
}

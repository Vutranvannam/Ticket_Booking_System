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
}

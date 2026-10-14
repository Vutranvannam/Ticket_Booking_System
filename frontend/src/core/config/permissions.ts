/**
 * Frontend mirror of backend AppPermissions.java.
 * Must match exactly the "code" column in permissions table.
 */
export const AppPermissions = {
  // User module
  USER_LIST:   "USER_LIST",
  USER_VIEW:   "USER_VIEW",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",

  // Venue module
  VENUE_LIST:   "VENUE_LIST",
  VENUE_VIEW:   "VENUE_VIEW",
  VENUE_CREATE: "VENUE_CREATE",
  VENUE_UPDATE: "VENUE_UPDATE",
  VENUE_DELETE: "VENUE_DELETE",
} as const;

export type AppPermission = typeof AppPermissions[keyof typeof AppPermissions];

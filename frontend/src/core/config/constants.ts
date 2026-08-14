export const APP_NAME = import.meta.env.VITE_APP_NAME || "Ticket Booking System";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  ORGANIZER: "ORGANIZER",
  CUSTOMER: "CUSTOMER",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  PAGE_SIZES: [10, 20, 50],
} as const;

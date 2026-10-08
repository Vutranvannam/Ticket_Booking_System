export const AUTH_ENDPOINTS = {
  LOGIN:            '/auth/login',
  REGISTER:         '/auth/register',
  REFRESH:          '/auth/refresh',
  LOGOUT:           '/auth/logout',
  FORGOT_PASSWORD:  '/auth/forgot-password',
  VERIFY_RESET_OTP: '/auth/verify-reset-otp',
  RESET_PASSWORD:   '/auth/reset-password',
  /** Browser redirect — not an Axios call. Initiates Google OAuth2 flow. */
  GOOGLE_OAUTH2: '/oauth2/authorization/google',
} as const;

export const USER_ENDPOINTS = {
  ME:     "/users/me",
  LIST:   "/users",
  BY_ID:  (id: string) => `/users/${id}`,
} as const;

export const VENUE_ENDPOINTS = {
  LIST: '/venues', // GET with query params for pagination & filters
  DETAIL: (id: string) => `/venues/${id}`,
  CREATE: '/venues', // POST
  UPDATE: (id: string) => `/venues/${id}`,
  DELETE: (id: string) => `/venues/${id}`,
} as const;

/**
 * In-memory access token store.
 * NEVER persists to localStorage or sessionStorage.
 * Refresh token is managed server-side via HttpOnly cookie.
 */
let _accessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => _accessToken,
  setAccessToken: (token: string): void => { _accessToken = token; },
  clearAccessToken: (): void => { _accessToken = null; },
};

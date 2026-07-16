/**
 * Token persistence helpers (localStorage).
 * Keys match product convention: access_token / refresh_token.
 */

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken?: string | null): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch {
    // private mode / quota — ignore
  }
}

export function clearTokens(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export const tokenStorage = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} as const;

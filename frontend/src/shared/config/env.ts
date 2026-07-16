/**
 * Public runtime config (browser-safe).
 * Next.js only exposes vars prefixed with NEXT_PUBLIC_* to the client.
 *
 * Note: This is Next.js (not Vite). Prefer NEXT_PUBLIC_API_BASE_URL.
 * NEXT_PUBLIC_API_URL is kept as a fallback for existing .env files.
 */
export const env = {
  /**
   * NestJS API base URL (e.g. http://localhost:3001)
   */
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001",

  /** @deprecated Use apiBaseUrl — kept for call-site compatibility */
  get apiUrl() {
    return this.apiBaseUrl;
  },

  isDev: process.env.NODE_ENV === "development",
  loginPath: "/login",
} as const;

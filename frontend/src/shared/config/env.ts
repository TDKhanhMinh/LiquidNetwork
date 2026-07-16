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
  onboardingPath: "/onboarding",
  setupProfilePath: "/setup-profile",

  /**
   * Google OAuth Web Client ID (GIS).
   * When empty, Google sign-in button is disabled with a helpful message.
   */
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  /**
   * Local mock for Phone OTP / password-reset when backend routes are not ready.
   * Accepts OTP `123456`. Does not issue real JWT — only for UI walkthrough.
   * Set NEXT_PUBLIC_AUTH_MOCK=true to enable (or false to force real API in dev).
   */
  authMock:
    process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
    (process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_AUTH_MOCK !== "false"),

  /**
   * Local mock for Invitation Queue when Nest module is not ready.
   * Default on in development unless NEXT_PUBLIC_QUEUE_MOCK=false.
   */
  queueMock:
    process.env.NEXT_PUBLIC_QUEUE_MOCK === "true" ||
    (process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_QUEUE_MOCK !== "false"),

  /** Live queue poll interval (ms) when SSE is unavailable */
  queuePollMs: Number(process.env.NEXT_PUBLIC_QUEUE_POLL_MS ?? 2000),

  /**
   * Global maintenance mode — app shell redirects authenticated users to /maintenance.
   * Set NEXT_PUBLIC_MAINTENANCE=true to enable.
   */
  maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE === "true",
} as const;

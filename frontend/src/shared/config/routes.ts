/**
 * App route map — single source of truth for navigation & auth redirects.
 * Keep paths stable; deep links and AuthGate depend on these constants.
 */

export const routes = {
  /** Public marketing landing (first visit) */
  landing: "/",
  /** Authenticated app home hub */
  home: "/home",

  // Auth / onboarding
  onboarding: "/onboarding",
  login: "/login",
  register: "/register",
  verifyOtp: "/verify-otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  setupProfile: "/setup-profile",

  // Core tabs
  queue: "/queue",
  queueNew: "/queue/new",
  queueHistory: "/queue/history",
  queueLive: (id: string) => `/queue/${id}`,

  invitations: (id: string) => `/invitations/${id}`,

  discover: "/discover",

  sessions: "/sessions",
  sessionsNew: "/sessions/new",
  sessionsHistory: "/sessions/history",
  sessionDetail: (id: string) => `/sessions/${id}`,

  safeRide: "/safe-ride",
  safeRideHistory: "/safe-ride/history",
  safeRideSettings: "/safe-ride/settings",

  chat: "/chat",
  chatThread: (id: string) => `/chat/${id}`,

  profile: "/profile",
  profileEdit: "/profile/edit",
  profileLevel: "/profile/level",
  profileReviews: "/profile/reviews",

  userPublic: (id: string) => `/users/${id}`,
  userReviews: (id: string) => `/users/${id}/reviews`,

  settings: "/settings",
  settingsAccount: "/settings/account",
  notifications: "/notifications",
  notificationSettings: "/notifications/settings",

  search: "/search",
  friends: "/friends",

  support: "/support",
  supportFaq: "/support/faq",
  supportReport: "/support/report",

  premium: "/premium",
  vouchers: "/vouchers",
  bookings: "/bookings",
  bookingNew: "/bookings/new",
  payments: "/payments",

  maintenance: "/maintenance",
} as const;

/** Routes that never require an access token */
export const PUBLIC_PATHS = [
  routes.landing,
  routes.onboarding,
  routes.login,
  routes.register,
  routes.verifyOtp,
  routes.forgotPassword,
  routes.resetPassword,
] as const;

/** Auth flow routes (no main bottom nav chrome) */
export const AUTH_FLOW_PATHS = [
  routes.onboarding,
  routes.login,
  routes.register,
  routes.verifyOtp,
  routes.forgotPassword,
  routes.resetPassword,
  routes.setupProfile,
] as const;

/** Bottom tab destinations */
export const MAIN_TAB_PATHS = [
  routes.home,
  routes.queue,
  routes.discover,
  routes.chat,
  routes.profile,
] as const;

export function isPublicPath(pathname: string): boolean {
  if (pathname === routes.landing) return true;
  return PUBLIC_PATHS.some(
    (path) =>
      path !== routes.landing &&
      (pathname === path || pathname.startsWith(`${path}/`)),
  );
}

export function isAuthFlowPath(pathname: string): boolean {
  return AUTH_FLOW_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Main app paths require a session (landing is separate marketing shell) */
export function isMainProtectedPath(pathname: string): boolean {
  if (pathname === routes.landing) return false;
  return !isAuthFlowPath(pathname);
}

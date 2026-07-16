/** Same-tab auth/onboarding change bus (localStorage is cross-tab only). */

export const AUTH_CHANGED_EVENT = "ln-auth-changed";

export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

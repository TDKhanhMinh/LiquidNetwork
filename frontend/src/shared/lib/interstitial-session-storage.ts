/**
 * sessionStorage flags for interstitial ads (once per browser tab session).
 * Key is namespaced as `ln.interstitial.{id}`.
 */

const PREFIX = "ln.interstitial.";

function canUseSessionStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

function storageKey(id: string): string {
  return id.startsWith(PREFIX) ? id : `${PREFIX}${id}`;
}

export function isInterstitialSeen(id: string): boolean {
  if (!canUseSessionStorage()) return false;
  try {
    return window.sessionStorage.getItem(storageKey(id)) === "1";
  } catch {
    return false;
  }
}

export function markInterstitialSeen(id: string): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.setItem(storageKey(id), "1");
  } catch {
    // private mode / quota
  }
}

export function clearInterstitialSeen(id: string): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(storageKey(id));
  } catch {
    // private mode
  }
}

/** Safe Ride entry interstitial — once per tab session. */
export const SAFE_RIDE_INTERSTITIAL_SESSION_KEY = "safe-ride";

export const interstitialSessionStorage = {
  isInterstitialSeen,
  markInterstitialSeen,
  clearInterstitialSeen,
  SAFE_RIDE_INTERSTITIAL_SESSION_KEY,
  PREFIX,
} as const;

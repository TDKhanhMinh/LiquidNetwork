/**
 * Client-side onboarding / first-time profile flags.
 * Sprint 0: localStorage until backend profile completeness is wired.
 */

const ONBOARDING_DONE_KEY = "ln.onboarding_done";
const PROFILE_SETUP_DONE_KEY = "ln.profile_setup_done";

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function getFlag(key: string): boolean {
  if (!canUseStorage()) return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setFlag(key: string, value: boolean): void {
  if (!canUseStorage()) return;
  try {
    if (value) {
      window.localStorage.setItem(key, "1");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // private mode / quota
  }
}

export function isOnboardingDone(): boolean {
  return getFlag(ONBOARDING_DONE_KEY);
}

export function setOnboardingDone(value = true): void {
  setFlag(ONBOARDING_DONE_KEY, value);
}

export function isProfileSetupDone(): boolean {
  return getFlag(PROFILE_SETUP_DONE_KEY);
}

export function setProfileSetupDone(value = true): void {
  setFlag(PROFILE_SETUP_DONE_KEY, value);
}

export function clearOnboardingFlags(): void {
  setFlag(ONBOARDING_DONE_KEY, false);
  setFlag(PROFILE_SETUP_DONE_KEY, false);
}

export const onboardingStorage = {
  isOnboardingDone,
  setOnboardingDone,
  isProfileSetupDone,
  setProfileSetupDone,
  clearOnboardingFlags,
  ONBOARDING_DONE_KEY,
  PROFILE_SETUP_DONE_KEY,
} as const;

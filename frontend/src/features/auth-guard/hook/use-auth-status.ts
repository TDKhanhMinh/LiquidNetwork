"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getAccessToken } from "@/shared/api";
import {
  AUTH_CHANGED_EVENT,
  notifyAuthChanged,
  isOnboardingDone,
  isProfileSetupDone,
} from "@/shared/lib";

export type AuthStatus = {
  /** False until first client read of localStorage */
  hydrated: boolean;
  isAuthenticated: boolean;
  onboardingDone: boolean;
  profileSetupDone: boolean;
  refresh: () => void;
};

type AuthSnapshot = {
  isAuthenticated: boolean;
  onboardingDone: boolean;
  profileSetupDone: boolean;
};

const serverSnapshot: AuthSnapshot = {
  isAuthenticated: false,
  onboardingDone: false,
  profileSetupDone: false,
};

let clientCache: AuthSnapshot = serverSnapshot;

function readAuthSnapshot(): AuthSnapshot {
  const next: AuthSnapshot = {
    isAuthenticated: Boolean(getAccessToken()),
    onboardingDone: isOnboardingDone(),
    profileSetupDone: isProfileSetupDone(),
  };

  if (
    clientCache.isAuthenticated === next.isAuthenticated &&
    clientCache.onboardingDone === next.onboardingDone &&
    clientCache.profileSetupDone === next.profileSetupDone
  ) {
    return clientCache;
  }

  clientCache = next;
  return clientCache;
}

function subscribeToken(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (
      event.key === "access_token" ||
      event.key === "ln.onboarding_done" ||
      event.key === "ln.profile_setup_done" ||
      event.key === null
    ) {
      callback();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
  };
}

export { notifyAuthChanged };

/**
 * Client auth + onboarding flags (localStorage).
 * Tokens live in localStorage — guard must run on the client.
 */
export function useAuthStatus(): AuthStatus {
  const [hydrated, setHydrated] = useState(false);

  const snapshot = useSyncExternalStore(
    subscribeToken,
    readAuthSnapshot,
    () => serverSnapshot,
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => {
    clientCache = {
      isAuthenticated: !clientCache.isAuthenticated,
      onboardingDone: clientCache.onboardingDone,
      profileSetupDone: clientCache.profileSetupDone,
    };
    clientCache = readAuthSnapshot();
    notifyAuthChanged();
  }, []);

  return {
    hydrated,
    isAuthenticated: snapshot.isAuthenticated,
    onboardingDone: snapshot.onboardingDone,
    profileSetupDone: snapshot.profileSetupDone,
    refresh,
  };
}

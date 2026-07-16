"use client";

import { useCallback, useState } from "react";
import type { SetupProfilePayload } from "@/entities/user";
import { userApi } from "@/entities/user";
import { notifyAuthChanged } from "@/shared/lib/auth-events";
import { setProfileSetupDone } from "@/shared/lib/onboarding-storage";
import { i18n } from "@/shared/i18n";
import { resolveErrorMessage } from "@/shared/lib/error-handler";

export function useSetupProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupProfile = useCallback(async (payload: SetupProfilePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await userApi.setupProfile(payload);
      setProfileSetupDone(true);
      notifyAuthChanged();
      setIsLoading(false);
      return user;
    } catch (err) {
      // Offline / mock token: still mark setup done so local UX can proceed
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      const isMockSession =
        typeof window !== "undefined" &&
        (window.localStorage.getItem("access_token") ?? "").startsWith(
          "mock.access.",
        );

      if (isMockSession) {
        setProfileSetupDone(true);
        notifyAuthChanged();
        setIsLoading(false);
        return null;
      }

      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return { setupProfile, isLoading, error };
}

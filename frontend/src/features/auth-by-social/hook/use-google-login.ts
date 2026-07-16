"use client";

import { useCallback, useState } from "react";
import { sessionApi } from "@/entities/session";
import { notifyAuthChanged } from "@/shared/lib/auth-events";
import { i18n } from "@/shared/i18n";
import { resolveErrorMessage } from "@/shared/lib/error-handler";

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogleToken = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionApi.googleLogin({ token });
      notifyAuthChanged();
      setIsLoading(false);
      return data;
    } catch (err) {
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return { loginWithGoogleToken, isLoading, error, setError };
}

"use client";

import { useCallback, useState } from "react";
import { sessionApi } from "@/entities/session";
import { getRefreshToken, resolveErrorMessage } from "@/shared/api";
import { i18n } from "@/shared/i18n";

/**
 * Logout feature hook — clears server session + local tokens.
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionApi.logout(getRefreshToken() ?? undefined);
    } catch (err) {
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { logout, isLoading, error };
}

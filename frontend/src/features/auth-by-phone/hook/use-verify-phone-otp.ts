"use client";

import { useCallback, useState } from "react";
import type { AuthResult } from "@/entities/session";
import { notifyAuthChanged } from "@/shared/lib/auth-events";
import { i18n } from "@/shared/i18n";
import { resolveErrorMessage } from "@/shared/lib/error-handler";
import { authByPhoneApi } from "../api/auth-by-phone-api";

export function useVerifyPhoneOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = useCallback(
    async (phone: string, code: string, name?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data: AuthResult = await authByPhoneApi.verifyOtp({
          phone,
          code,
          name,
        });
        notifyAuthChanged();
        setIsLoading(false);
        return data;
      } catch (err) {
        const message = resolveErrorMessage(err, i18n.t.bind(i18n));
        setError(message);
        setIsLoading(false);
        throw err;
      }
    },
    [],
  );

  return { verifyOtp, isLoading, error };
}

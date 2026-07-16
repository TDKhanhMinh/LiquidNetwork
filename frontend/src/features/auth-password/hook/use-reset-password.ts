"use client";

import { useCallback, useState } from "react";
import { i18n } from "@/shared/i18n";
import { resolveErrorMessage } from "@/shared/lib/error-handler";
import { authPasswordApi } from "../api/auth-password-api";

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await authPasswordApi.reset({ token, password });
      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return { resetPassword, isLoading, error, success };
}

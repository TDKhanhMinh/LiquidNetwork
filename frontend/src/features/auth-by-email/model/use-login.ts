"use client";

import { useCallback, useState } from "react";
import type { AuthResult, LoginCredentials } from "@/entities/session";
import { i18n } from "@/shared/i18n";
import { resolveErrorMessage } from "@/shared/lib/error-handler";
import { authByEmailApi } from "../api/auth-by-email-api";

interface UseLoginState {
  data: AuthResult | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Application hook for email/password login.
 * Wire tokens into session storage / provider when auth UX is implemented.
 */
export function useLogin() {
  const [state, setState] = useState<UseLoginState>({
    data: null,
    error: null,
    isLoading: false,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data = await authByEmailApi.login(credentials);
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (err) {
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      setState({ data: null, error: message, isLoading: false });
      throw err;
    }
  }, []);

  return { ...state, login };
}

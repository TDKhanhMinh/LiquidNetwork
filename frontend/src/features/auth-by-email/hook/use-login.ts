"use client";

import { useCallback, useState } from "react";
import type { AuthResult, LoginCredentials } from "@/entities/session";
import { i18n } from "@/shared/i18n";
import { notifyAuthChanged } from "@/shared/lib/auth-events";
import { resolveErrorMessage } from "@/shared/lib/error-handler";
import { authByEmailApi } from "../api/auth-by-email-api";

interface UseLoginState {
  data: AuthResult | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Application hook for email/password login.
 * Tokens are persisted by sessionApi; notifies AuthGate listeners.
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
      notifyAuthChanged();
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

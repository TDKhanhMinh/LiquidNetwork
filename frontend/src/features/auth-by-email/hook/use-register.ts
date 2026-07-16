"use client";

import { useCallback, useState } from "react";
import type { AuthResult, RegisterCredentials } from "@/entities/session";
import { i18n } from "@/shared/i18n";
import { notifyAuthChanged } from "@/shared/lib/auth-events";
import { resolveErrorMessage } from "@/shared/lib/error-handler";
import { authByEmailApi } from "../api/auth-by-email-api";

interface UseRegisterState {
  data: AuthResult | null;
  error: string | null;
  isLoading: boolean;
}

export function useRegister() {
  const [state, setState] = useState<UseRegisterState>({
    data: null,
    error: null,
    isLoading: false,
  });

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data = await authByEmailApi.register(credentials);
      notifyAuthChanged();
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (err) {
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      setState({ data: null, error: message, isLoading: false });
      throw err;
    }
  }, []);

  return { ...state, register };
}

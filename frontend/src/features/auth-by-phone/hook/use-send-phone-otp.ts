"use client";

import { useCallback, useState } from "react";
import type { OtpPurpose, SendPhoneOtpResult } from "@/entities/session";
import { i18n } from "@/shared/i18n";
import { resolveErrorMessage } from "@/shared/lib/error-handler";
import { authByPhoneApi } from "../api/auth-by-phone-api";

export function useSendPhoneOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendPhoneOtpResult | null>(null);

  const sendOtp = useCallback(async (phone: string, purpose: OtpPurpose) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authByPhoneApi.sendOtp({ phone, purpose });
      setResult(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const message = resolveErrorMessage(err, i18n.t.bind(i18n));
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return { sendOtp, isLoading, error, result };
}

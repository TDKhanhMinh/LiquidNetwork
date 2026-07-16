import { isAxiosError } from "axios";
import { toast } from "sonner";
import { i18n } from "@/shared/i18n";
import { ApiError, isExceptionResponse } from "./types";

type TranslateFn = (
  key: string,
  options?: { defaultValue?: string },
) => string;

function getT(t?: TranslateFn): TranslateFn {
  return (
    t ??
    ((key, options) => {
      const value = i18n.t(key, { defaultValue: options?.defaultValue ?? "" });
      return typeof value === "string" ? value : String(value);
    })
  );
}

function translate(
  t: TranslateFn,
  key: string,
  defaultValue: string,
): string {
  const result = t(key, { defaultValue: "" });
  if (result && result !== key && result !== "") {
    return result;
  }
  return defaultValue;
}

/**
 * Convert Axios / unknown errors into a normalized {@link ApiError}.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;

    if (isExceptionResponse(payload)) {
      return new ApiError(
        payload.error.message,
        status,
        payload.error.code,
        payload,
        payload.error.details,
      );
    }

    if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      const nested =
        typeof record.error === "object" && record.error !== null
          ? (record.error as Record<string, unknown>)
          : null;

      const code =
        (typeof nested?.code === "string" && nested.code) ||
        (typeof record.code === "string" && record.code) ||
        undefined;

      const message =
        (typeof nested?.message === "string" && nested.message) ||
        (typeof record.message === "string" && record.message) ||
        error.message ||
        `Request failed with status ${status}`;

      return new ApiError(
        message,
        status,
        code,
        payload,
        nested?.details ?? record.details,
      );
    }

    // Network / timeout (no response)
    if (!error.response) {
      return new ApiError(
        error.message || "Network error",
        0,
        "NETWORK_ERROR",
        error.toJSON?.() ?? error,
      );
    }

    return new ApiError(
      error.message || `Request failed with status ${status}`,
      status,
      undefined,
      payload,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0, "UNKNOWN");
  }

  return new ApiError("Something went wrong", 0, "UNKNOWN", error);
}

/**
 * Map errors to a user-facing message via i18n `error` namespace.
 * Prefers backend `error.code` → `error:CODE` (e.g. VALIDATION_ERROR, INVITATION_TIMEOUT).
 */
export function resolveErrorMessage(
  error: unknown,
  t?: TranslateFn,
): string {
  const translateFn = getT(t);
  const apiError = normalizeApiError(error);

  if (apiError.code) {
    const fromCode = translate(
      translateFn,
      `error:${apiError.code}`,
      "",
    );
    if (fromCode) return fromCode;
  }

  if (apiError.message) {
    return apiError.message;
  }

  return translate(
    translateFn,
    "error:UNKNOWN",
    "Something went wrong. Please try again.",
  );
}

/** Toast an error (requires `<Toaster />` in the tree). */
export function notifyError(error: unknown, t?: TranslateFn): string {
  const message = resolveErrorMessage(error, t);
  toast.error(message);
  return message;
}

export const errorHandler = {
  normalizeApiError,
  resolveErrorMessage,
  notifyError,
} as const;

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/shared/config";
import { normalizeApiError } from "./errorHandler";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./tokenStorage";
import type { ApiResponse, AuthTokenPair, RequestConfigExtras } from "./types";
import { ApiError } from "./types";

/** Extended config used by interceptors */
export type AppAxiosRequestConfig = InternalAxiosRequestConfig &
  RequestConfigExtras & {
    /** Internal: request already retried after refresh */
    _retry?: boolean;
  };

// ---------------------------------------------------------------------------
// Refresh coordination — single flight + queue (avoid parallel refresh storms)
// ---------------------------------------------------------------------------

let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    } else {
      item.reject(error ?? new Error("Token refresh failed"));
    }
  });
  failedQueue = [];
}

/** Paths that must never trigger refresh (or send stale Authorization). */
const AUTH_SKIP_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/google",
];

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const loginPath = env.loginPath;
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
}

/**
 * Bare client for token refresh — no response interceptors that unwrap/retry,
 * so we never recurse into the refresh flow.
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

async function refreshAccessToken(): Promise<AuthTokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("Missing refresh token", 401, "UNAUTHORIZED");
  }

  const response = await refreshClient.post<ApiResponse<AuthTokenPair>>(
    "/auth/refresh",
    { refreshToken },
  );

  const envelope = response.data;
  if (!envelope?.success || !envelope.data?.accessToken) {
    throw new ApiError(
      envelope?.error?.message ?? "Refresh token failed",
      401,
      envelope?.error?.code ?? "INVALID_REFRESH_TOKEN",
      envelope,
    );
  }

  const pair = envelope.data;
  setTokens(pair.accessToken, pair.refreshToken ?? refreshToken);
  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken ?? refreshToken,
  };
}

// ---------------------------------------------------------------------------
// Main Axios instance
// ---------------------------------------------------------------------------

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

// --- Request: attach Bearer access token ---
axiosInstance.interceptors.request.use((config: AppAxiosRequestConfig) => {
  if (config.skipAuth) {
    return config;
  }

  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- Response: unwrap success envelope + 401 refresh ---
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as AppAxiosRequestConfig;
    const payload = response.data as ApiResponse<unknown> | unknown;

    // Non-envelope (file blob, plain text, etc.)
    if (
      !payload ||
      typeof payload !== "object" ||
      !("success" in (payload as object))
    ) {
      return response;
    }

    const envelope = payload as ApiResponse<unknown>;

    if (envelope.success === false) {
      return Promise.reject(
        new ApiError(
          envelope.error?.message ??
            envelope.message ??
            "Request was not successful",
          response.status,
          envelope.error?.code,
          envelope,
          envelope.error?.details,
        ),
      );
    }

    // success: true → unwrap `data` unless rawEnvelope requested
    if (!config.rawEnvelope) {
      response.data = envelope.data;
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AppAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    const status = error.response?.status;
    const isUnauthorized = status === 401;
    const alreadyRetried = originalRequest._retry === true;
    const skipRefresh =
      originalRequest.skipRefresh === true ||
      shouldSkipRefresh(originalRequest.url);

    // --- Auto refresh + retry ---
    if (isUnauthorized && !alreadyRetried && !skipRefresh) {
      if (isRefreshing) {
        // Wait for the in-flight refresh, then retry with new token
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest._retry = true;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await refreshAccessToken();
        processQueue(null, tokens.accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        redirectToLogin();
        return Promise.reject(normalizeApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    // Refresh endpoint itself returned 401, or non-refreshable 401
    if (isUnauthorized && skipRefresh) {
      clearTokens();
      // Avoid redirect loop on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith(env.loginPath)
      ) {
        redirectToLogin();
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default axiosInstance;

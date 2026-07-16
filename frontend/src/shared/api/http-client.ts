/**
 * @deprecated Prefer `apiClient` from `@/shared/api`.
 * Thin adapter over Axios for legacy call sites that used fetch-style options.
 */
import { apiClient } from "./apiClient";
import type { ApiRequestConfig } from "./apiClient";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Skip Authorization header */
  skipAuth?: boolean;
  /** @deprecated Tokens are read from localStorage; kept for call-site compatibility */
  token?: string | null;
  raw?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, skipAuth, raw, headers, signal } = options;

  const config: ApiRequestConfig = {
    skipAuth,
    rawEnvelope: raw,
    headers,
    signal,
  };

  switch (method) {
    case "GET":
      return apiClient.get<T>(path, config);
    case "POST":
      return apiClient.post<T>(path, body, config);
    case "PUT":
      return apiClient.put<T>(path, body, config);
    case "PATCH":
      return apiClient.patch<T>(path, body, config);
    case "DELETE":
      return apiClient.delete<T>(path, config);
    default:
      return apiClient.get<T>(path, config);
  }
}

export { axiosInstance } from "./axiosInstance";
export type { AppAxiosRequestConfig } from "./axiosInstance";

export { apiClient } from "./apiClient";
export type { ApiRequestConfig } from "./apiClient";

export {
  errorHandler,
  normalizeApiError,
  notifyError,
  resolveErrorMessage,
} from "./errorHandler";

export {
  tokenStorage,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokenStorage";

export type {
  ApiResponse,
  ApiErrorBody,
  AuthTokenPair,
  CursorPaginationMeta,
  ExceptionResponse,
  OffsetPaginationMeta,
  PaginatedData,
  PaginationMeta,
  RequestConfigExtras,
} from "./types";
export { ApiError, isExceptionResponse } from "./types";

/**
 * @deprecated Prefer {@link apiClient} or {@link axiosInstance}.
 * Kept as a thin adapter so older entity APIs keep compiling during migration.
 */
export { httpClient } from "./http-client";
export type { HttpMethod, RequestOptions } from "./http-client";

/**
 * Shared API contracts — aligned with NestJS backend envelopes.
 *
 * Success:  { success: true, data, message?, meta?, timestamp? }
 * Error:    { success: false, error: { code, message, details? }, timestamp?, path? }
 */

export interface OffsetPaginationMeta {
  type: "offset";
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPaginationMeta {
  type: "cursor";
  limit: number;
  nextCursor: string | null;
  prevCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
}

export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiErrorBody;
  meta?: PaginationMeta;
  timestamp?: string;
  path?: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
  message?: string;
}

/** Backend AllExceptionsFilter shape */
export interface ExceptionResponse {
  success: false;
  error: ApiErrorBody;
  timestamp?: string;
  path?: string;
}

/**
 * Normalized client-side API error.
 * Use `code` for i18n keys under the `error` namespace.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly body?: unknown,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isExceptionResponse(value: unknown): value is ExceptionResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.error !== "object" || record.error === null) {
    return false;
  }
  const error = record.error as Record<string, unknown>;
  return typeof error.code === "string" && typeof error.message === "string";
}

/** Auth token pair stored in localStorage */
export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Custom Axios config flags (set via request config) */
export interface RequestConfigExtras {
  /** Skip Authorization header */
  skipAuth?: boolean;
  /** Do not attempt refresh + retry on 401 */
  skipRefresh?: boolean;
  /** Return full ApiResponse instead of unwrapped `data` */
  rawEnvelope?: boolean;
}

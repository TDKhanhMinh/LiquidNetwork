/**
 * Re-export API types from the canonical location (`shared/api/types`).
 * Prefer importing from `@/shared/api` in new code.
 */
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
} from "@/shared/api/types";

export { ApiError, isExceptionResponse } from "@/shared/api/types";

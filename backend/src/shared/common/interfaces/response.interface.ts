export interface OffsetPaginationMeta {
  type: 'offset';
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPaginationMeta {
  type: 'cursor';
  limit: number;
  nextCursor: string | null;
  prevCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
}

export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface StandardResponse<T> {
  data: T;
  message?: string;
}

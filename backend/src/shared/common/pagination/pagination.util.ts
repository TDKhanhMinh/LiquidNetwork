import {
  CursorPaginationMeta,
  OffsetPaginationMeta,
  PaginatedData,
} from '../interfaces/response.interface';

export class PaginationUtil {
  /**
   * Helper to build an Offset Paginated Response
   */
  static buildOffsetPagination<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedData<T> {
    const totalPages = Math.ceil(total / limit);

    const meta: OffsetPaginationMeta = {
      type: 'offset',
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      items,
      meta,
    };
  }

  /**
   * Helper to build a Cursor Paginated Response
   */
  static buildCursorPagination<T>(
    items: T[],
    limit: number,
    nextCursor: string | null = null,
    prevCursor: string | null = null,
    hasNextPage: boolean = false,
    hasPreviousPage: boolean = false,
  ): PaginatedData<T> {
    const meta: CursorPaginationMeta = {
      type: 'cursor',
      limit,
      nextCursor,
      prevCursor,
      hasNextPage,
      hasPreviousPage,
    };

    return {
      items,
      meta,
    };
  }
}

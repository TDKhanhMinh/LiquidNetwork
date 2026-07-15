import { PopulateOptions, SortOrder } from 'mongoose';

export type FilterQueryType<T> = Record<string, any>;
export type UpdateQueryType<T> = Record<string, any>;

export interface FindOptions {
  sort?: string | Record<string, SortOrder>;
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
  select?: string | string[] | Record<string, number>;
  limit?: number;
  skip?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IBaseRepository<T, K = string> {
  create(data: Partial<T> | unknown): Promise<T>;
  findById(id: K): Promise<T | null>;
  findOne(filter: FilterQueryType<T>): Promise<T | null>;
  findAll(filter?: FilterQueryType<T>, options?: FindOptions): Promise<T[]>;
  findWithPagination(
    filter: FilterQueryType<T>,
    page: number,
    limit: number,
    sort?: string | Record<string, SortOrder>
  ): Promise<PaginatedResult<T>>;
  updateById(id: K, data: Partial<T> | unknown): Promise<T | null>;
  updateOne(filter: FilterQueryType<T>, data: Partial<T> | unknown): Promise<T | null>;
  deleteById(id: K, softDelete?: boolean): Promise<boolean>;
  exists(filter: FilterQueryType<T>): Promise<boolean>;
  count(filter?: FilterQueryType<T>): Promise<number>;
}

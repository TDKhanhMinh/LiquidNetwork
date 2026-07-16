import { Document, Model } from 'mongoose';
import { FilterQueryType, FindOptions, IBaseRepository, PaginatedResult, UpdateQueryType } from './base.repository.interface';

export abstract class BaseRepository<T extends Document, K = string> implements IBaseRepository<T, K> {
  protected constructor(protected readonly model: Model<T>) {}

  /**
   * Enrich the filter query to ignore soft-deleted records by default
   */
  protected enrichFilter(filter: FilterQueryType<T>): FilterQueryType<T> {
    if (!filter) {
      return { isDeleted: { $ne: true } };
    }
    if (typeof filter.isDeleted === 'undefined') {
      return { ...filter, isDeleted: { $ne: true } };
    }
    return filter;
  }

  async create(data: Partial<T> | unknown): Promise<T> {
    const createdDocument = new this.model(data);
    return createdDocument.save() as unknown as Promise<T>;
  }

  async findById(id: K): Promise<T | null> {
    const filter = this.enrichFilter({ _id: id });
    return this.model.findOne(filter).exec() as Promise<T | null>;
  }

  async findOne(filter: FilterQueryType<T>): Promise<T | null> {
    return this.model.findOne(this.enrichFilter(filter)).exec() as Promise<T | null>;
  }

  async findAll(filter: FilterQueryType<T> = {}, options?: FindOptions): Promise<T[]> {
    let query: any = this.model.find(this.enrichFilter(filter));
    
    if (options?.select) {
      query = query.select(options.select);
    }
    if (options?.sort) {
      query = query.sort(options.sort);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.populate) {
      query = query.populate(options.populate as any);
    }

    return query.exec() as Promise<T[]>;
  }

  async findWithPagination(
    filter: FilterQueryType<T>,
    page: number = 1,
    limit: number = 10,
    sort?: string | Record<string, any>
  ): Promise<PaginatedResult<T>> {
    const enrichedFilter = this.enrichFilter(filter);
    const skip = Math.max(0, (page - 1) * limit);

    const [data, total] = await Promise.all([
      this.model
        .find(enrichedFilter)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .exec() as Promise<T[]>,
      this.model.countDocuments(enrichedFilter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async updateById(id: K, data: Partial<T> | unknown): Promise<T | null> {
    const filter = this.enrichFilter({ _id: id });
    return this.model
      .findOneAndUpdate(filter, data as UpdateQueryType<T>, {
        returnDocument: 'after',
      })
      .exec() as Promise<T | null>;
  }

  async updateOne(filter: FilterQueryType<T>, data: Partial<T> | unknown): Promise<T | null> {
    return this.model
      .findOneAndUpdate(this.enrichFilter(filter), data as UpdateQueryType<T>, {
        returnDocument: 'after',
      })
      .exec() as Promise<T | null>;
  }

  async deleteById(id: K, softDelete: boolean = true): Promise<boolean> {
    const filter = { _id: id };
    if (softDelete) {
      const result = await this.model.updateOne(
        filter,
        { $set: { isDeleted: true, deletedAt: new Date() } } as unknown as UpdateQueryType<T>
      ).exec();
      return result.modifiedCount > 0;
    } else {
      const result = await this.model.deleteOne(filter).exec();
      return result.deletedCount > 0;
    }
  }

  async exists(filter: FilterQueryType<T>): Promise<boolean> {
    const result = await this.model.exists(this.enrichFilter(filter)).exec();
    return result !== null;
  }

  async count(filter: FilterQueryType<T> = {}): Promise<number> {
    return this.model.countDocuments(this.enrichFilter(filter)).exec();
  }
}

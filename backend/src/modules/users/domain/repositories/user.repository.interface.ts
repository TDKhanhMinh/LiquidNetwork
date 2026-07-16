import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { AlcoholToleranceLevel } from '../enums/alcohol-tolerance-level.enum';
import { IUser } from '../interfaces/user.interface';

export interface FindMatchingPoolParams {
  excludeUserId: string;
  alcoholToleranceLevels?: AlcoholToleranceLevel[];
  excludeUserIds?: string[];
  limit: number;
}

export interface IUserRepository extends IBaseRepository<IUser> {
  /**
   * Search visible users for invitation candidates.
   * Excludes soft-deleted, self, and hideProfile=true.
   */
  searchCandidates(
    query: string,
    excludeUserId: string,
    limit?: number,
  ): Promise<IUser[]>;

  /** Load multiple users by id (order not guaranteed). */
  findByIds(ids: string[]): Promise<IUser[]>;

  /**
   * Pre-filter pool for matching (privacy + optional level filters).
   * Sorted by updatedAt desc; hard-capped by limit.
   */
  findMatchingPool(params: FindMatchingPoolParams): Promise<IUser[]>;
}

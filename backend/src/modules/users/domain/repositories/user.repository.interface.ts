import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IUser } from '../interfaces/user.interface';

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
}

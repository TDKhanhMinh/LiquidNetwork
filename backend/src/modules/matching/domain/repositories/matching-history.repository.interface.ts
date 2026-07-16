import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IMatchingHistory } from '../entities/matching-history.entity';

export interface IMatchingHistoryRepository
  extends IBaseRepository<IMatchingHistory> {
  /**
   * Distinct candidate user ids that appeared in recent matching results
   * for this requester (within `since`).
   */
  findRecentCandidateIds(
    requesterId: string,
    since: Date,
  ): Promise<string[]>;
}

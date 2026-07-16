import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IMatchingPreference } from '../entities/matching-preference.entity';

export interface IMatchingPreferenceRepository
  extends IBaseRepository<IMatchingPreference> {
  findByUserId(userId: string): Promise<IMatchingPreference | null>;
  upsertByUserId(
    userId: string,
    data: Partial<IMatchingPreference>,
  ): Promise<IMatchingPreference>;
}

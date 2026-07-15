import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IPeerReview } from '../interfaces/peer-review.interface';

export interface IPeerReviewRepository extends IBaseRepository<IPeerReview> {
  // Add specific methods for PeerReview if necessary
}

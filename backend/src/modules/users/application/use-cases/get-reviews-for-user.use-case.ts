import { Injectable, Inject } from '@nestjs/common';
import type { IPeerReviewRepository } from '../../domain/repositories/peer-review.repository.interface';
import { IPeerReview } from '../../domain/interfaces/peer-review.interface';

@Injectable()
export class GetReviewsForUserUseCase {
  constructor(
    @Inject('IPeerReviewRepository')
    private readonly peerReviewRepository: IPeerReviewRepository,
  ) {}

  async execute(userId: string): Promise<IPeerReview[]> {
    return this.peerReviewRepository.findAll({ revieweeId: userId });
  }
}

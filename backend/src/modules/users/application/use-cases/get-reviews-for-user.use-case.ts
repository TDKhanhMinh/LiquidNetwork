import { Injectable, Inject } from '@nestjs/common';
import type { IPeerReviewRepository } from '../../domain/repositories/peer-review.repository.interface';
import { IPeerReview } from '../../domain/interfaces/peer-review.interface';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import { assertCanViewProfile } from '../services/user-privacy.helper';

@Injectable()
export class GetReviewsForUserUseCase {
  constructor(
    @Inject('IPeerReviewRepository')
    private readonly peerReviewRepository: IPeerReviewRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(userId: string, requesterId: string): Promise<IPeerReview[]> {
    const user = await this.findUserByIdUseCase.execute(userId);
    assertCanViewProfile(user, requesterId);
    return this.peerReviewRepository.findAll({ revieweeId: userId });
  }
}

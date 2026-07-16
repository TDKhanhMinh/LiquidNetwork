import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { QueueUserRef } from './search-candidates.use-case';

@Injectable()
export class ListCandidateSuggestionsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(requesterId: string, limit = 6): Promise<QueueUserRef[]> {
    // Empty query → basic suggestions pool
    const users = await this.userRepository.searchCandidates(
      '',
      requesterId,
      limit,
    );
    return users.map((u) => ({
      id: String((u as any)._id),
      name: u.name,
      avatar: u.avatar,
      alcoholToleranceLevel: u.privacySettings?.hideLevel
        ? undefined
        : u.alcoholToleranceLevel,
      occupation: u.drunkProfile?.occupation,
    }));
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IUser } from '../../../users/domain/interfaces/user.interface';

export interface QueueUserRef {
  id: string;
  name: string;
  avatar?: string;
  alcoholToleranceLevel?: string;
  occupation?: string;
}

@Injectable()
export class SearchCandidatesUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    requesterId: string,
    query: string,
    limit = 20,
  ): Promise<QueueUserRef[]> {
    const users = await this.userRepository.searchCandidates(
      query,
      requesterId,
      limit,
    );
    return users.map((u) => this.toRef(u));
  }

  private toRef(user: IUser): QueueUserRef {
    return {
      id: String((user as any)._id),
      name: user.name,
      avatar: user.avatar,
      alcoholToleranceLevel: user.privacySettings?.hideLevel
        ? undefined
        : user.alcoholToleranceLevel,
      occupation: user.drunkProfile?.occupation,
    };
  }
}

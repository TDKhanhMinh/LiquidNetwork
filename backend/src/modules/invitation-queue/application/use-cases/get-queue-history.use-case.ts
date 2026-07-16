import { Inject, Injectable } from '@nestjs/common';
import type { IInvitationRepository } from '../../domain/repositories/invitation.repository.interface';
import { IInvitation } from '../../domain/entities/invitation.entity';

export interface QueueHistoryResult {
  sent: IInvitation[];
  received: IInvitation[];
  sentTotal: number;
  receivedTotal: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetQueueHistoryUseCase {
  constructor(
    @Inject('IInvitationRepository')
    private readonly invitationRepository: IInvitationRepository,
  ) {}

  async execute(
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<QueueHistoryResult> {
    return this.invitationRepository.findHistoryForUser(userId, {
      page,
      limit,
    });
  }
}

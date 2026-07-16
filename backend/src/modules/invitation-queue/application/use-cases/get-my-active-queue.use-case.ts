import { Inject, Injectable } from '@nestjs/common';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';

@Injectable()
export class GetMyActiveQueueUseCase {
  constructor(
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
  ) {}

  async execute(hostId: string): Promise<IInvitationQueue | null> {
    return this.queueRepository.findActiveByHostId(hostId);
  }
}

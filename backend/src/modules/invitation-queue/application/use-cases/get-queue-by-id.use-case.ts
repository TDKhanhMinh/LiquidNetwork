import { Inject, Injectable } from '@nestjs/common';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { ForbiddenException } from '../../../../shared/common/exceptions/forbidden.exception';

@Injectable()
export class GetQueueByIdUseCase {
  constructor(
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
  ) {}

  async execute(
    queueId: string,
    requesterId: string,
  ): Promise<IInvitationQueue> {
    const queue = await this.queueRepository.findById(queueId as any);
    if (!queue || queue.isDeleted) {
      throw new NotFoundException('Queue not found', 'QUEUE_NOT_FOUND');
    }

    const isHost = queue.hostId === requesterId;
    const isParticipant = queue.participants.some(
      (p) => p.userId === requesterId,
    );

    if (!isHost && !isParticipant) {
      throw new ForbiddenException(
        'You are not part of this queue',
        'FORBIDDEN_QUEUE_ACCESS',
      );
    }

    return queue;
  }
}

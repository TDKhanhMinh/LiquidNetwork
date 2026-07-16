import { Inject, Injectable } from '@nestjs/common';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueuePersistenceHelper } from '../services/queue-persistence.helper';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';

@Injectable()
export class CancelQueueUseCase {
  constructor(
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
    private readonly advanceService: QueueAdvanceService,
    private readonly persistence: QueuePersistenceHelper,
  ) {}

  async execute(queueId: string, hostId: string): Promise<IInvitationQueue> {
    const queue = await this.queueRepository.findById(queueId as any);
    if (!queue || queue.isDeleted) {
      throw new NotFoundException('Queue not found', 'QUEUE_NOT_FOUND');
    }

    // Domain errors (ForbiddenQueueAccess, QueueNotActive) propagate
    const transition = this.advanceService.applyCancel(queue, hostId);

    const saved = await this.queueRepository.replaceActiveByHost(
      queueId,
      hostId,
      {
        status: transition.queue.status,
        participants: transition.queue.participants,
        expiresAt: null,
        completedAt: transition.queue.completedAt ?? null,
      },
    );

    if (!saved) {
      throw new ConflictException('Queue is not active', 'QUEUE_NOT_ACTIVE');
    }

    const result = { ...transition, queue: saved };
    await this.persistence.cancelPendingInvitations(String(saved._id));
    await this.persistence.applySideEffectsAfterTransition(result, {
      rethrowOnJobFailure: false,
    });

    return saved;
  }
}

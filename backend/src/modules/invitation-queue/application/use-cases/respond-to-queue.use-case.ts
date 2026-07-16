import { Inject, Injectable } from '@nestjs/common';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import { RespondQueueCommand } from '../dto/respond-queue.command';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueuePersistenceHelper } from '../services/queue-persistence.helper';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';

@Injectable()
export class RespondToQueueUseCase {
  constructor(
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
    private readonly advanceService: QueueAdvanceService,
    private readonly persistence: QueuePersistenceHelper,
  ) {}

  async execute(command: RespondQueueCommand): Promise<IInvitationQueue> {
    const queue = await this.queueRepository.findById(command.queueId as any);
    if (!queue || queue.isDeleted) {
      throw new NotFoundException('Queue not found', 'QUEUE_NOT_FOUND');
    }

    // Domain errors (NotYourTurn, QueueNotActive) propagate to the filter
    const transition = this.advanceService.applyRespond(
      queue,
      command.actorUserId,
      command.accept,
    );

    const expectedGeneration = queue.generation;
    const saved = await this.queueRepository.replaceActiveState(
      command.queueId,
      expectedGeneration,
      {
        status: transition.queue.status,
        currentIndex: transition.queue.currentIndex,
        participants: transition.queue.participants,
        expiresAt: transition.queue.expiresAt ?? null,
        generation: transition.queue.generation,
        completedAt: transition.queue.completedAt ?? null,
      },
    );

    if (!saved) {
      throw new ConflictException(
        'Queue state changed; please refresh',
        'QUEUE_NOT_ACTIVE',
      );
    }

    const result = { ...transition, queue: saved };
    // Queue doc is source of truth — side effects best-effort (log, don't roll back)
    await this.persistence.applySideEffectsAfterTransition(result, {
      rethrowOnJobFailure: false,
    });

    return saved;
  }
}

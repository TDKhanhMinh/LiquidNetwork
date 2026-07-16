import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueuePersistenceHelper } from '../services/queue-persistence.helper';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';

export interface HandleInviteTimeoutCommand {
  queueId: string;
  generation: number;
}

@Injectable()
export class HandleInviteTimeoutUseCase {
  private readonly logger = new Logger(HandleInviteTimeoutUseCase.name);

  constructor(
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
    private readonly advanceService: QueueAdvanceService,
    private readonly persistence: QueuePersistenceHelper,
  ) {}

  async execute(
    command: HandleInviteTimeoutCommand,
  ): Promise<IInvitationQueue | null> {
    const queue = await this.queueRepository.findById(command.queueId as any);
    if (!queue || queue.isDeleted) {
      this.logger.debug(`Timeout no-op: queue missing ${command.queueId}`);
      return null;
    }

    const transition = this.advanceService.applyTimeout(
      queue,
      command.generation,
    );
    if (!transition) {
      this.logger.debug(
        `Timeout no-op: stale generation queue=${command.queueId} gen=${command.generation}`,
      );
      return null;
    }

    const saved = await this.queueRepository.replaceActiveState(
      command.queueId,
      command.generation,
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
      this.logger.debug(
        `Timeout lost race queue=${command.queueId} gen=${command.generation}`,
      );
      return null;
    }

    const result = { ...transition, queue: saved };
    // Rethrow job failures so BullMQ retries (idempotent via generation)
    await this.persistence.applySideEffectsAfterTransition(result, {
      rethrowOnJobFailure: true,
    });

    return saved;
  }
}

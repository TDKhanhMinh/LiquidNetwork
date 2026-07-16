import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IInvitationRepository } from '../../domain/repositories/invitation.repository.interface';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import type { IInvitationTimeoutScheduler } from '../../domain/services/invitation-timeout-scheduler.interface';
import type { IInvitationNotifier } from '../../domain/services/invitation-notifier.interface';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { InvitationStatus } from '../../domain/enums/invitation-status.enum';
import { QueueStatus } from '../../domain/enums/queue-status.enum';
import {
  InvitationUpsertHint,
  QueueTransitionResult,
} from './queue-advance.service';

export interface SideEffectOptions {
  /**
   * When true (timeout processor), rethrow schedule failures so BullMQ retries.
   * When false (HTTP respond/cancel), log and keep queue doc as source of truth.
   */
  rethrowOnJobFailure?: boolean;
}

/**
 * Shared side-effects after a queue state transition is computed.
 */
@Injectable()
export class QueuePersistenceHelper {
  private readonly logger = new Logger(QueuePersistenceHelper.name);

  constructor(
    @Inject('IInvitationRepository')
    private readonly invitationRepository: IInvitationRepository,
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
    @Inject('IInvitationTimeoutScheduler')
    private readonly timeoutScheduler: IInvitationTimeoutScheduler,
    @Inject('IInvitationNotifier')
    private readonly notifier: IInvitationNotifier,
  ) {}

  async applyInvitationHints(
    queue: IInvitationQueue,
    hints: InvitationUpsertHint[],
  ): Promise<void> {
    const queueId = String(queue._id);
    for (const hint of hints) {
      const existing = await this.invitationRepository.findByQueueAndInvitee(
        queueId,
        hint.toUserId,
      );

      if (existing) {
        await this.invitationRepository.updateStatusByQueueAndInvitee(
          queueId,
          hint.toUserId,
          hint.status,
          {
            expiresAt: hint.expiresAt,
            respondedAt: hint.respondedAt,
          },
        );
      } else {
        await this.invitationRepository.create({
          queueId,
          fromUserId: queue.hostId,
          fromUserName: queue.hostName,
          fromUserAvatar: queue.hostAvatar,
          toUserId: hint.toUserId,
          toUserName: hint.toUserName,
          toUserAvatar: hint.toUserAvatar,
          status: hint.status,
          message: queue.message,
          timeoutSeconds: queue.timeoutSeconds,
          expiresAt: hint.expiresAt,
          respondedAt: hint.respondedAt,
          participantOrder: hint.participantOrder,
        });
      }
    }
  }

  /**
   * Critical path: cancel old timeout jobs + schedule next window.
   * Throws on failure so callers can compensate / retry.
   */
  async applyTimeoutJobs(result: QueueTransitionResult): Promise<void> {
    const queueId = String(result.queue._id);

    for (const gen of result.cancelGenerations) {
      await this.timeoutScheduler.cancel(queueId, gen);
    }

    if (result.schedule) {
      await this.timeoutScheduler.schedule(
        queueId,
        result.schedule.generation,
        result.schedule.delayMs,
      );
    }
  }

  /** Schedule with small inline retries (Redis blip recovery). */
  async applyTimeoutJobsWithRetry(
    result: QueueTransitionResult,
    attempts = 3,
  ): Promise<void> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        await this.applyTimeoutJobs(result);
        return;
      } catch (err) {
        lastErr = err;
        this.logger.warn(
          `Timeout job apply attempt ${i + 1}/${attempts} failed queue=${String(result.queue._id)}: ${String(err)}`,
        );
      }
    }
    throw lastErr;
  }

  /** Best-effort notifications — never fail the business transaction. */
  async notifyTransition(result: QueueTransitionResult): Promise<void> {
    try {
      await this.notifier.onQueueUpdated(result.queue);

      if (result.terminal) {
        if (result.queue.status === QueueStatus.CANCELLED) {
          await this.notifier.onCancelled(result.queue);
        } else {
          await this.notifier.onCompleted(result.queue);
        }
        return;
      }

      const head = result.queue.participants[result.queue.currentIndex];
      if (head) {
        await this.notifier.onYourTurn(result.queue, head.userId);
      }
    } catch (err) {
      this.logger.warn(
        `Notifier failed for queue ${String(result.queue._id)}: ${String(err)}`,
      );
    }
  }

  /**
   * Post-atomic-write side effects.
   * Queue document is already committed — do not roll it back.
   */
  async applySideEffectsAfterTransition(
    result: QueueTransitionResult,
    options: SideEffectOptions = {},
  ): Promise<void> {
    const { rethrowOnJobFailure = false } = options;
    const queueId = String(result.queue._id);

    try {
      await this.applyInvitationHints(result.queue, result.invitationHints);
    } catch (err) {
      this.logger.error(
        `Invitation hints failed after queue update queue=${queueId}: ${String(err)}`,
      );
      // Do not rethrow — queue state is authoritative; history can be reconciled later
    }

    try {
      await this.applyTimeoutJobsWithRetry(result);
    } catch (err) {
      this.logger.error(
        `Timeout jobs failed after queue update queue=${queueId}: ${String(err)}`,
      );
      if (rethrowOnJobFailure) {
        throw err;
      }
    }

    await this.notifyTransition(result);
  }

  async applyJobsAndNotify(result: QueueTransitionResult): Promise<void> {
    await this.applyTimeoutJobs(result);
    await this.notifyTransition(result);
  }

  /**
   * Roll back a partially-created queue (invitations / timeout schedule failed).
   * Hard-deletes queue so the host can retry (frees partial unique active index).
   */
  async compensateFailedCreate(
    queueId: string,
    generation: number,
  ): Promise<void> {
    try {
      await this.timeoutScheduler.cancel(queueId, generation);
    } catch (err) {
      this.logger.warn(
        `Compensate: cancel job failed queue=${queueId}: ${String(err)}`,
      );
    }

    try {
      await this.invitationRepository.deleteAllByQueueId(queueId);
    } catch (err) {
      this.logger.warn(
        `Compensate: delete invitations failed queue=${queueId}: ${String(err)}`,
      );
    }

    try {
      await this.queueRepository.deleteById(queueId as any, false);
    } catch (err) {
      this.logger.error(
        `Compensate: hard-delete queue failed queue=${queueId}: ${String(err)}`,
      );
    }
  }

  async cancelPendingInvitations(queueId: string): Promise<void> {
    await this.invitationRepository.cancelPendingByQueueId(queueId);
  }

  isPending(status: InvitationStatus): boolean {
    return status === InvitationStatus.PENDING;
  }
}

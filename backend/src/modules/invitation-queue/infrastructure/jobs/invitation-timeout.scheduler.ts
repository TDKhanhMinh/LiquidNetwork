import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IInvitationTimeoutScheduler } from '../../domain/services/invitation-timeout-scheduler.interface';
import {
  INVITATION_TIMEOUT_QUEUE,
  INVITE_WINDOW_EXPIRED_JOB,
  invitationTimeoutJobId,
} from './invitation-timeout.constants';

export interface InviteTimeoutJobPayload {
  queueId: string;
  generation: number;
}

@Injectable()
export class InvitationTimeoutScheduler
  implements IInvitationTimeoutScheduler
{
  private readonly logger = new Logger(InvitationTimeoutScheduler.name);

  constructor(
    @InjectQueue(INVITATION_TIMEOUT_QUEUE)
    private readonly queue: Queue,
  ) {}

  async schedule(
    queueId: string,
    generation: number,
    delayMs: number,
  ): Promise<void> {
    const jobId = invitationTimeoutJobId(queueId, generation);
    const payload: InviteTimeoutJobPayload = { queueId, generation };

    // Remove any prior job with same id (re-schedule safety)
    try {
      const existing = await this.queue.getJob(jobId);
      if (existing) {
        await existing.remove();
      }
    } catch {
      // ignore missing
    }

    await this.queue.add(INVITE_WINDOW_EXPIRED_JOB, payload, {
      jobId,
      delay: Math.max(0, delayMs),
      removeOnComplete: true,
      removeOnFail: 100,
    });

    this.logger.debug(
      `Scheduled timeout job ${jobId} delay=${delayMs}ms`,
    );
  }

  async cancel(queueId: string, generation: number): Promise<void> {
    const jobId = invitationTimeoutJobId(queueId, generation);
    try {
      const existing = await this.queue.getJob(jobId);
      if (existing) {
        await existing.remove();
        this.logger.debug(`Cancelled timeout job ${jobId}`);
      }
    } catch (err) {
      this.logger.warn(`Failed to cancel job ${jobId}: ${String(err)}`);
    }
  }
}

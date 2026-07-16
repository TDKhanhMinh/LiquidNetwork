import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HandleInviteTimeoutUseCase } from '../../application/use-cases/handle-invite-timeout.use-case';
import {
  INVITATION_TIMEOUT_QUEUE,
  INVITE_WINDOW_EXPIRED_JOB,
} from './invitation-timeout.constants';
import type { InviteTimeoutJobPayload } from './invitation-timeout.scheduler';

@Processor(INVITATION_TIMEOUT_QUEUE)
export class InvitationTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(InvitationTimeoutProcessor.name);

  constructor(
    private readonly handleInviteTimeout: HandleInviteTimeoutUseCase,
  ) {
    super();
  }

  async process(job: Job<InviteTimeoutJobPayload>): Promise<void> {
    if (job.name !== INVITE_WINDOW_EXPIRED_JOB) {
      return;
    }

    const { queueId, generation } = job.data;
    this.logger.debug(
      `Processing timeout queueId=${queueId} generation=${generation}`,
    );

    await this.handleInviteTimeout.execute({ queueId, generation });
  }
}

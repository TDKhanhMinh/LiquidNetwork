import { Injectable, Logger } from '@nestjs/common';
import { IInvitationNotifier } from '../../domain/services/invitation-notifier.interface';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';

@Injectable()
export class NoopInvitationNotifier implements IInvitationNotifier {
  private readonly logger = new Logger(NoopInvitationNotifier.name);

  async onQueueUpdated(queue: IInvitationQueue): Promise<void> {
    this.logger.debug(
      `queue.updated id=${String(queue._id)} status=${queue.status}`,
    );
  }

  async onYourTurn(
    queue: IInvitationQueue,
    inviteeUserId: string,
  ): Promise<void> {
    this.logger.debug(
      `queue.your-turn id=${String(queue._id)} user=${inviteeUserId}`,
    );
  }

  async onCompleted(queue: IInvitationQueue): Promise<void> {
    this.logger.debug(
      `queue.completed id=${String(queue._id)} status=${queue.status}`,
    );
  }

  async onCancelled(queue: IInvitationQueue): Promise<void> {
    this.logger.debug(`queue.cancelled id=${String(queue._id)}`);
  }
}

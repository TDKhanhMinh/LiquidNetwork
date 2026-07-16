import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IInvitationQueue } from '../entities/invitation-queue.entity';

export interface IInvitationQueueRepository
  extends IBaseRepository<IInvitationQueue> {
  findActiveByHostId(hostId: string): Promise<IInvitationQueue | null>;

  /**
   * Optimistic lock replace of full queue state when generation matches and status is active.
   * Returns null when the condition fails (lost race).
   */
  replaceActiveState(
    queueId: string,
    expectedGeneration: number,
    next: Partial<IInvitationQueue>,
  ): Promise<IInvitationQueue | null>;

  /**
   * Host cancel: only when status is active and host matches.
   */
  replaceActiveByHost(
    queueId: string,
    hostId: string,
    next: Partial<IInvitationQueue>,
  ): Promise<IInvitationQueue | null>;
}

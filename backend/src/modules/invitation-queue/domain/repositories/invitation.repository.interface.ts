import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { InvitationStatus } from '../enums/invitation-status.enum';
import { IInvitation } from '../entities/invitation.entity';

export interface IInvitationRepository extends IBaseRepository<IInvitation> {
  findByQueueAndInvitee(
    queueId: string,
    toUserId: string,
  ): Promise<IInvitation | null>;

  findHistoryForUser(
    userId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{
    sent: IInvitation[];
    received: IInvitation[];
    sentTotal: number;
    receivedTotal: number;
    page: number;
    limit: number;
  }>;

  cancelPendingByQueueId(queueId: string): Promise<void>;

  /** Hard-delete all invitations for a queue (create compensation). */
  deleteAllByQueueId(queueId: string): Promise<void>;

  updateStatusByQueueAndInvitee(
    queueId: string,
    toUserId: string,
    status: InvitationStatus,
    extras?: Partial<Pick<IInvitation, 'expiresAt' | 'respondedAt'>>,
  ): Promise<IInvitation | null>;
}

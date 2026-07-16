import { QueueStatus } from '../enums/queue-status.enum';
import { IQueueParticipant } from './queue-participant.entity';

export interface IInvitationQueue {
  _id?: any;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  title?: string;
  message?: string;
  status: QueueStatus;
  timeoutSeconds: number;
  currentIndex: number;
  participants: IQueueParticipant[];
  expiresAt?: Date | null;
  /** Bumps whenever the active head changes; used for timeout job idempotency */
  generation: number;
  sessionId?: string | null;
  completedAt?: Date | null;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

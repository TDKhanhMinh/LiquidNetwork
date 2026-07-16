import { InvitationStatus } from '../enums/invitation-status.enum';

export interface IInvitation {
  _id?: any;
  queueId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar?: string;
  status: InvitationStatus;
  message?: string;
  timeoutSeconds: number;
  expiresAt?: Date | null;
  respondedAt?: Date | null;
  participantOrder: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

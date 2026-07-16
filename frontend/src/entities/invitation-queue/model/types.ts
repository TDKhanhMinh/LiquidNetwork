/**
 * Sequential Invitation Queue — domain types for LiquidNetwork core feature.
 * Aligns with planned NestJS invitation-queue module contracts.
 */

export type QueueStatus =
  | "draft"
  | "active"
  | "completed"
  | "cancelled"
  | "matched";

export type ParticipantStatus =
  | "pending"
  | "active"
  | "accepted"
  | "rejected"
  | "timeout"
  | "skipped";

export type InvitationDirection = "sent" | "received";

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "timeout"
  | "cancelled";

/** @deprecated use QueueStatus */
export type InvitationQueueStatus = QueueStatus | ParticipantStatus | string;

export interface QueueUserRef {
  id: string;
  name: string;
  avatar?: string;
  alcoholToleranceLevel?: string;
  occupation?: string;
}

export interface QueueParticipant {
  userId: string;
  name: string;
  avatar?: string;
  order: number;
  status: ParticipantStatus;
  invitedAt?: string | null;
  respondedAt?: string | null;
}

export interface InvitationQueue {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  title?: string;
  message?: string;
  status: QueueStatus;
  /** Per-invitee response window (seconds) */
  timeoutSeconds: number;
  /** Index into participants for the current active invite */
  currentIndex: number;
  participants: QueueParticipant[];
  /** When the current invitee window ends (ISO) */
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
}

/** Flat invitation for history / detail / receive list */
export interface Invitation {
  id: string;
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
  expiresAt?: string | null;
  createdAt: string;
  respondedAt?: string | null;
  direction?: InvitationDirection;
}

export interface CreateQueueInput {
  title?: string;
  message?: string;
  timeoutSeconds: number;
  /** Ordered invitee user ids (priority high → low) */
  inviteeIds: string[];
  /** Snapshot names/avatars for offline/mock */
  invitees?: QueueUserRef[];
}

export interface RespondInvitationInput {
  queueId: string;
  accept: boolean;
}

/** Legacy join shape (kept for older hooks) */
export interface JoinInvitationQueueInput {
  sessionId?: string;
  preferences?: Record<string, unknown>;
}

/** @deprecated alias */
export type InvitationQueueItem = InvitationQueue;

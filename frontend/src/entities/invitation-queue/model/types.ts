/**
 * Invitation queue entity — expand as backend domain stabilizes.
 */
export type InvitationQueueStatus =
  | "waiting"
  | "matched"
  | "timeout"
  | "cancelled"
  | string;

export interface InvitationQueueItem {
  id: string;
  userId: string;
  status: InvitationQueueStatus;
  createdAt?: string;
  expiresAt?: string | null;
}

import { apiClient } from "@/shared/api";
import type { InvitationQueueItem } from "../model/types";

export interface JoinInvitationQueueInput {
  sessionId?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Module API for invitation-queue (NestJS module).
 * Keep pure HTTP here — React Query hooks live in features/entities consumers.
 */
export const invitationQueueApi = {
  join(input: JoinInvitationQueueInput = {}) {
    return apiClient.post<InvitationQueueItem>("/invitation-queue", input);
  },

  getMyQueue() {
    return apiClient.get<InvitationQueueItem | null>("/invitation-queue/me");
  },

  leave(queueId: string) {
    return apiClient.delete<void>(`/invitation-queue/${queueId}`);
  },
};

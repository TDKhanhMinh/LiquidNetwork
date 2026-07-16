import { ApiError, apiClient, getAccessToken } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  CreateQueueInput,
  Invitation,
  InvitationQueue,
  JoinInvitationQueueInput,
  QueueUserRef,
} from "../model/types";
import { DEMO_CANDIDATES, queueMockStore } from "../lib/mock-store";

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.code === "NOT_IMPLEMENTED"
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

/** Best-effort current user for mock host identity */
function mockHost(): QueueUserRef {
  if (typeof window === "undefined") {
    return { id: "me", name: "Bạn" };
  }
  try {
    const raw = window.localStorage.getItem("ln.mock_user");
    if (raw) return JSON.parse(raw) as QueueUserRef;
  } catch {
    // ignore
  }
  const token = getAccessToken() ?? "anon";
  const id = token.startsWith("mock.") ? "mock-user" : `user_${token.slice(-8)}`;
  return { id, name: "Bạn" };
}

export function setMockHostProfile(user: QueueUserRef) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("ln.mock_user", JSON.stringify(user));
  } catch {
    // ignore
  }
}

/**
 * Invitation Queue HTTP + mock fallback (backend module not shipped yet).
 */
export const invitationQueueApi = {
  /** @deprecated prefer createQueue */
  join(input: JoinInvitationQueueInput = {}) {
    return apiClient.post<InvitationQueue>("/invitation-queue", input);
  },

  async createQueue(input: CreateQueueInput): Promise<InvitationQueue> {
    try {
      return await apiClient.post<InvitationQueue>(
        "/invitation-queue",
        input,
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        return queueMockStore.create(mockHost(), input);
      }
      throw err;
    }
  },

  async getMyQueue(): Promise<InvitationQueue | null> {
    try {
      return await apiClient.get<InvitationQueue | null>(
        "/invitation-queue/me",
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        return queueMockStore.listMyActive(mockHost().id);
      }
      throw err;
    }
  },

  async getById(queueId: string): Promise<InvitationQueue> {
    try {
      return await apiClient.get<InvitationQueue>(
        `/invitation-queue/${queueId}`,
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        const q = queueMockStore.getById(queueId);
        if (!q) {
          throw new ApiError("Queue not found", 404, "NOT_FOUND");
        }
        return q;
      }
      throw err;
    }
  },

  async respond(queueId: string, accept: boolean): Promise<InvitationQueue> {
    try {
      return await apiClient.post<InvitationQueue>(
        `/invitation-queue/${queueId}/respond`,
        { accept },
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        // In mock, host can drive Accept/Reject for the current invitee (demo UX).
        const q = queueMockStore.getById(queueId);
        const actorId =
          q?.participants[q.currentIndex]?.userId ?? mockHost().id;
        return queueMockStore.respond(queueId, actorId, accept);
      }
      throw err;
    }
  },

  async cancel(queueId: string): Promise<InvitationQueue> {
    try {
      return await apiClient.post<InvitationQueue>(
        `/invitation-queue/${queueId}/cancel`,
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        return queueMockStore.cancel(queueId, mockHost().id);
      }
      throw err;
    }
  },

  async leave(queueId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/invitation-queue/${queueId}`);
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        await invitationQueueApi.cancel(queueId);
        return;
      }
      throw err;
    }
  },

  async history(): Promise<{ sent: Invitation[]; received: Invitation[] }> {
    try {
      return await apiClient.get<{ sent: Invitation[]; received: Invitation[] }>(
        "/invitation-queue/history",
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        const host = mockHost();
        queueMockStore.ensureDemoReceived(host.id);
        return queueMockStore.history(host.id);
      }
      throw err;
    }
  },

  async getInvitation(invitationId: string): Promise<Invitation> {
    try {
      return await apiClient.get<Invitation>(
        `/invitation-queue/invitations/${invitationId}`,
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        const inv = queueMockStore.getInvitation(invitationId);
        if (!inv) {
          throw new ApiError("Invitation not found", 404, "NOT_FOUND");
        }
        return inv;
      }
      throw err;
    }
  },

  async searchCandidates(query: string): Promise<QueueUserRef[]> {
    try {
      return await apiClient.get<QueueUserRef[]>("/invitation-queue/candidates", {
        params: { q: query },
      });
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        return queueMockStore.searchCandidates(query);
      }
      throw err;
    }
  },

  /** Suggestions without query */
  async listSuggestions(): Promise<QueueUserRef[]> {
    try {
      return await apiClient.get<QueueUserRef[]>(
        "/invitation-queue/candidates/suggestions",
      );
    } catch (err) {
      if (env.queueMock && isNotReadyError(err)) {
        return DEMO_CANDIDATES.slice(0, 6);
      }
      throw err;
    }
  },
};

export type { JoinInvitationQueueInput };

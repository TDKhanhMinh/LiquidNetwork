import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  CreatePeerReviewPayload,
  LevelHistoryEntry,
  PeerReview,
} from "../model/types";
import { peerReviewMockStore } from "../lib/mock-store";

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.code === "NOT_IMPLEMENTED" ||
      err.status === 401
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

const useMock =
  env.authMock ||
  process.env.NEXT_PUBLIC_USER_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USER_MOCK !== "false");

export const peerReviewApi = {
  async listForUser(userId: string): Promise<PeerReview[]> {
    try {
      return await apiClient.get<PeerReview[]>(`/users/${userId}/reviews`);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return peerReviewMockStore.listForUser(userId);
      }
      throw err;
    }
  },

  async create(
    revieweeId: string,
    payload: CreatePeerReviewPayload,
  ): Promise<PeerReview> {
    try {
      return await apiClient.post<PeerReview>(
        `/users/${revieweeId}/reviews`,
        payload,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return peerReviewMockStore.create(
          revieweeId,
          "mock-user",
          "Bạn",
          payload,
        );
      }
      throw err;
    }
  },

  async levelHistory(
    userId: string,
    currentLevel?: string,
  ): Promise<LevelHistoryEntry[]> {
    try {
      return await apiClient.get<LevelHistoryEntry[]>(
        `/users/${userId}/level-history`,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return peerReviewMockStore.levelHistory(userId, currentLevel);
      }
      throw err;
    }
  },
};

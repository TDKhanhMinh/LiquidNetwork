import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  CreateDrinkingSessionInput,
  DrinkingSession,
  EndSessionInput,
  InviteToSessionInput,
} from "../model/types";
import { sessionMockStore } from "../lib/mock-store";

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.status === 401
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

const useMock =
  env.authMock ||
  process.env.NEXT_PUBLIC_SESSION_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_SESSION_MOCK !== "false");

export const drinkingSessionApi = {
  async list(): Promise<DrinkingSession[]> {
    try {
      return await apiClient.get<DrinkingSession[]>("/drinking-sessions");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        sessionMockStore.ensureSeed();
        return sessionMockStore.list();
      }
      throw err;
    }
  },

  async getById(id: string): Promise<DrinkingSession> {
    try {
      return await apiClient.get<DrinkingSession>(`/drinking-sessions/${id}`);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        const s = sessionMockStore.getById(id);
        if (!s) throw new ApiError("Session not found", 404, "NOT_FOUND");
        return s;
      }
      throw err;
    }
  },

  async create(input: CreateDrinkingSessionInput): Promise<DrinkingSession> {
    try {
      return await apiClient.post<DrinkingSession>(
        "/drinking-sessions",
        input,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return sessionMockStore.create(input);
      }
      throw err;
    }
  },

  async invite(
    id: string,
    input: InviteToSessionInput,
  ): Promise<DrinkingSession> {
    try {
      return await apiClient.post<DrinkingSession>(
        `/drinking-sessions/${id}/invite`,
        input,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return sessionMockStore.invite(id, input.userIds);
      }
      throw err;
    }
  },

  async checkIn(id: string): Promise<DrinkingSession> {
    try {
      return await apiClient.post<DrinkingSession>(
        `/drinking-sessions/${id}/check-in`,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return sessionMockStore.checkIn(id);
      }
      throw err;
    }
  },

  async end(id: string, input: EndSessionInput = {}): Promise<DrinkingSession> {
    try {
      return await apiClient.post<DrinkingSession>(
        `/drinking-sessions/${id}/end`,
        input,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return sessionMockStore.end(id, input.rating, input.comment);
      }
      throw err;
    }
  },

  async cancel(id: string): Promise<DrinkingSession> {
    try {
      return await apiClient.post<DrinkingSession>(
        `/drinking-sessions/${id}/cancel`,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return sessionMockStore.cancel(id);
      }
      throw err;
    }
  },
};

export type { CreateDrinkingSessionInput };

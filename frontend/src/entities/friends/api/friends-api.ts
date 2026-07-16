import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type { Friend, FriendRelation } from "../model/types";
import { MOCK_FRIENDS } from "../lib/mock-data";

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
  process.env.NEXT_PUBLIC_FRIENDS_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_FRIENDS_MOCK !== "false");

export const friendsApi = {
  async list(relation?: FriendRelation | "all"): Promise<Friend[]> {
    try {
      return await apiClient.get<Friend[]>("/friends", {
        params: relation && relation !== "all" ? { relation } : undefined,
      });
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        if (!relation || relation === "all") return MOCK_FRIENDS;
        if (relation === "both") {
          return MOCK_FRIENDS.filter((f) => f.relation === "both");
        }
        return MOCK_FRIENDS.filter(
          (f) => f.relation === relation || f.relation === "both",
        );
      }
      throw err;
    }
  },
};

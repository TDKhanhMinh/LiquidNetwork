import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  SetupProfilePayload,
  UpdateDrunkProfilePayload,
  UpdateToleranceLevelPayload,
  UpdateUserPayload,
  User,
} from "../model/types";
import { userMockStore } from "../lib/mock-store";

function genderLabel(gender: SetupProfilePayload["gender"]): string {
  switch (gender) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "Không chia sẻ";
  }
}

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

export { userMockStore } from "../lib/mock-store";

export const userApi = {
  async getById(id: string) {
    try {
      return await apiClient.get<User>(`/users/${id}`);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return userMockStore.getById(id);
      }
      throw err;
    }
  },

  async getMe() {
    try {
      return await apiClient.get<User>("/users/me");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return userMockStore.getMe();
      }
      throw err;
    }
  },

  async updateMe(payload: UpdateUserPayload) {
    try {
      return await apiClient.patch<User>("/users/me", payload);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return userMockStore.updateMe(payload);
      }
      throw err;
    }
  },

  async updateDrunkProfile(payload: UpdateDrunkProfilePayload) {
    try {
      return await apiClient.patch<User>("/users/me/drunk-profile", payload);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return userMockStore.updateDrunkProfile(payload);
      }
      throw err;
    }
  },

  async updateToleranceLevel(payload: UpdateToleranceLevelPayload) {
    try {
      return await apiClient.patch<User>("/users/me/tolerance-level", payload);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return userMockStore.updateTolerance(payload);
      }
      throw err;
    }
  },

  async updatePrivacy(payload: {
    privacySettings: { hideProfile?: boolean; hideLevel?: boolean };
  }) {
    try {
      return await apiClient.patch<User>("/users/me/privacy", payload);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return userMockStore.updatePrivacy(payload.privacySettings);
      }
      throw err;
    }
  },

  /**
   * First-time setup: basic info + tolerance.
   * Gender/birthYear are stored in bio until dedicated backend fields exist.
   */
  async setupProfile(payload: SetupProfilePayload): Promise<User> {
    const bio = `${genderLabel(payload.gender)} · ${payload.birthYear}`;
    try {
      await apiClient.patch<User>("/users/me", {
        name: payload.name.trim(),
        phone: payload.phone?.trim() || undefined,
        bio,
      } satisfies UpdateUserPayload);

      return await apiClient.patch<User>("/users/me/tolerance-level", {
        level: payload.alcoholToleranceLevel,
      });
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        userMockStore.updateMe({
          name: payload.name.trim(),
          phone: payload.phone?.trim() || undefined,
          bio,
        });
        return userMockStore.updateTolerance({
          level: payload.alcoholToleranceLevel,
        });
      }
      throw err;
    }
  },
};


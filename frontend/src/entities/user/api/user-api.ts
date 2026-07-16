import { apiClient } from "@/shared/api";
import type { User } from "../model/types";

export const userApi = {
  getById(id: string) {
    return apiClient.get<User>(`/users/${id}`);
  },

  getMe() {
    return apiClient.get<User>("/auth/me");
  },
};

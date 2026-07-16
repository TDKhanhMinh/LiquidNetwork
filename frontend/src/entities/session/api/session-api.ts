import { apiClient, setTokens, clearTokens } from "@/shared/api";
import type {
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  Session,
} from "../model/types";

/** Backend may return tokens + user under a single payload */
export interface AuthResult {
  user: Session["user"];
  accessToken: string;
  refreshToken: string;
}

export const sessionApi = {
  async login(credentials: LoginCredentials) {
    const data = await apiClient.post<AuthResult>("/auth/login", credentials, {
      skipAuth: true,
      skipRefresh: true,
    });
    if (data?.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  async register(credentials: RegisterCredentials) {
    const data = await apiClient.post<AuthResult>(
      "/auth/register",
      credentials,
      {
        skipAuth: true,
        skipRefresh: true,
      },
    );
    if (data?.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  refresh(refreshToken: string) {
    return apiClient.post<AuthTokens>(
      "/auth/refresh",
      { refreshToken },
      { skipAuth: true, skipRefresh: true },
    );
  },

  async logout(refreshToken?: string) {
    try {
      await apiClient.post<void>(
        "/auth/logout",
        refreshToken ? { refreshToken } : undefined,
      );
    } finally {
      clearTokens();
    }
  },

  me() {
    return apiClient.get<Session["user"]>("/auth/me");
  },
};

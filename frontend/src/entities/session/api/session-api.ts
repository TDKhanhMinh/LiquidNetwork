import { ApiError, apiClient, setTokens, clearTokens } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  AuthTokens,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordPayload,
  SendPhoneOtpPayload,
  SendPhoneOtpResult,
  Session,
  VerifyPhoneOtpPayload,
} from "../model/types";

/** Backend may return tokens + user under a single payload */
export interface AuthResult {
  user: Session["user"];
  accessToken: string;
  refreshToken: string;
}

const MOCK_OTP = "123456";
const MOCK_OTP_KEY = "ln.mock_otp_phone";

function storeMockPhone(phone: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MOCK_OTP_KEY, phone);
  } catch {
    // ignore
  }
}

function readMockPhone(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(MOCK_OTP_KEY);
  } catch {
    return null;
  }
}

function clearMockPhone() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(MOCK_OTP_KEY);
  } catch {
    // ignore
  }
}

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.code === "NOT_IMPLEMENTED" ||
      err.code === "GOOGLE_AUTH_DISABLED"
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
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

  async googleLogin(payload: GoogleLoginPayload) {
    const data = await apiClient.post<AuthResult>("/auth/google", payload, {
      skipAuth: true,
      skipRefresh: true,
    });
    if (data?.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  async sendPhoneOtp(
    payload: SendPhoneOtpPayload,
  ): Promise<SendPhoneOtpResult> {
    try {
      return await apiClient.post<SendPhoneOtpResult>(
        "/auth/phone/send-otp",
        payload,
        { skipAuth: true, skipRefresh: true },
      );
    } catch (err) {
      if (env.authMock && isNotReadyError(err)) {
        storeMockPhone(payload.phone);
        return { expiresIn: 300, mock: true };
      }
      throw err;
    }
  },

  async verifyPhoneOtp(payload: VerifyPhoneOtpPayload): Promise<AuthResult> {
    try {
      const data = await apiClient.post<AuthResult>(
        "/auth/phone/verify-otp",
        payload,
        { skipAuth: true, skipRefresh: true },
      );
      if (data?.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      clearMockPhone();
      return data;
    } catch (err) {
      if (
        env.authMock &&
        isNotReadyError(err) &&
        payload.code === MOCK_OTP &&
        (readMockPhone() === payload.phone || true)
      ) {
        // UI walkthrough only — no real JWT; surface clear mock tokens
        // so AuthGate can proceed in local demos without Nest phone routes.
        const mock: AuthResult = {
          user: {
            id: "mock-user",
            name: payload.name?.trim() || "Người dùng",
            email: "",
            phone: payload.phone,
          },
          accessToken: `mock.access.${Date.now()}`,
          refreshToken: `mock.refresh.${Date.now()}`,
        };
        setTokens(mock.accessToken, mock.refreshToken);
        clearMockPhone();
        return mock;
      }
      throw err;
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ ok: true }> {
    try {
      await apiClient.post<void>("/auth/forgot-password", payload, {
        skipAuth: true,
        skipRefresh: true,
      });
      return { ok: true };
    } catch (err) {
      if (env.authMock && isNotReadyError(err)) {
        return { ok: true };
      }
      throw err;
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ ok: true }> {
    try {
      await apiClient.post<void>("/auth/reset-password", payload, {
        skipAuth: true,
        skipRefresh: true,
      });
      return { ok: true };
    } catch (err) {
      if (env.authMock && isNotReadyError(err)) {
        return { ok: true };
      }
      throw err;
    }
  },
};

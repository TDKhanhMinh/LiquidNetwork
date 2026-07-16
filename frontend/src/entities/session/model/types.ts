/**
 * Session slice owns its own user shape to avoid cross-import
 * between entities (FSD: slices on the same layer stay isolated).
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

/** Auth tokens returned by the API */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Authenticated session payload */
export interface Session {
  user: SessionUser;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export type OtpPurpose = "login" | "register" | "reset";

export interface SendPhoneOtpPayload {
  phone: string;
  purpose: OtpPurpose;
}

export interface VerifyPhoneOtpPayload {
  phone: string;
  code: string;
  /** Required when purpose is register and backend creates account */
  name?: string;
}

export interface SendPhoneOtpResult {
  expiresIn: number;
  /** Dev mock only */
  mock?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface GoogleLoginPayload {
  token: string;
}

/**
 * Session slice owns its own user shape to avoid cross-import
 * between entities (FSD: slices on the same layer stay isolated).
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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

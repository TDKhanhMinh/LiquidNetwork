import { sessionApi } from "@/entities/session";
import type { LoginCredentials, RegisterCredentials } from "@/entities/session";

/** Feature-level API composition over session entity */
export const authByEmailApi = {
  login: (credentials: LoginCredentials) => sessionApi.login(credentials),
  register: (credentials: RegisterCredentials) =>
    sessionApi.register(credentials),
};

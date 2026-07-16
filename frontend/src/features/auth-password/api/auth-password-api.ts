import { sessionApi } from "@/entities/session";
import type {
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/entities/session";

export const authPasswordApi = {
  forgot: (payload: ForgotPasswordPayload) =>
    sessionApi.forgotPassword(payload),
  reset: (payload: ResetPasswordPayload) => sessionApi.resetPassword(payload),
};

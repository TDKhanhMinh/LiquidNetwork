import { sessionApi } from "@/entities/session";
import type {
  SendPhoneOtpPayload,
  VerifyPhoneOtpPayload,
} from "@/entities/session";

export const authByPhoneApi = {
  sendOtp: (payload: SendPhoneOtpPayload) => sessionApi.sendPhoneOtp(payload),
  verifyOtp: (payload: VerifyPhoneOtpPayload) =>
    sessionApi.verifyPhoneOtp(payload),
};

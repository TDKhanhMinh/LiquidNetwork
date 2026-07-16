import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  CreateReportInput,
  FaqItem,
  SupportReport,
} from "../model/types";
import { FAQ_ITEMS } from "../lib/faq-data";
import { supportMockStore } from "../lib/mock-store";

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
  process.env.NEXT_PUBLIC_SUPPORT_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_SUPPORT_MOCK !== "false");

export const supportApi = {
  async listFaq(): Promise<FaqItem[]> {
    try {
      return await apiClient.get<FaqItem[]>("/support/faq");
    } catch (err) {
      if (useMock && isNotReadyError(err)) return FAQ_ITEMS;
      throw err;
    }
  },

  async createReport(input: CreateReportInput): Promise<SupportReport> {
    try {
      return await apiClient.post<SupportReport>("/support/reports", input);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return supportMockStore.createReport(input);
      }
      throw err;
    }
  },

  async listReports(): Promise<SupportReport[]> {
    try {
      return await apiClient.get<SupportReport[]>("/support/reports");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return supportMockStore.listReports();
      }
      throw err;
    }
  },
};

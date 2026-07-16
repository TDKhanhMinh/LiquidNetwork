import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  CreateRideInput,
  FineBand,
  RideRequest,
  SafeRidePrefs,
} from "../model/types";
import { DECREE_100_FINES } from "../lib/fines-data";
import { safeRideMockStore } from "../lib/mock-store";

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
  process.env.NEXT_PUBLIC_SAFE_RIDE_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_SAFE_RIDE_MOCK !== "false");

export const safeRideApi = {
  async getFines(): Promise<FineBand[]> {
    try {
      return await apiClient.get<FineBand[]>("/safe-ride/fines");
    } catch (err) {
      if (useMock && isNotReadyError(err)) return DECREE_100_FINES;
      throw err;
    }
  },

  async listRides(): Promise<RideRequest[]> {
    try {
      return await apiClient.get<RideRequest[]>("/safe-ride/rides");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return safeRideMockStore.listRides();
      }
      throw err;
    }
  },

  async requestRide(input: CreateRideInput): Promise<RideRequest> {
    try {
      return await apiClient.post<RideRequest>("/safe-ride/rides", input);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return safeRideMockStore.requestRide(input);
      }
      throw err;
    }
  },

  async getPrefs(): Promise<SafeRidePrefs> {
    try {
      return await apiClient.get<SafeRidePrefs>("/safe-ride/prefs");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return safeRideMockStore.getPrefs();
      }
      throw err;
    }
  },

  async updatePrefs(prefs: Partial<SafeRidePrefs>): Promise<SafeRidePrefs> {
    try {
      return await apiClient.patch<SafeRidePrefs>("/safe-ride/prefs", prefs);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return safeRideMockStore.setPrefs(prefs);
      }
      throw err;
    }
  },

  providerLink(provider: CreateRideInput["provider"]) {
    return safeRideMockStore.deepLink(provider);
  },
};

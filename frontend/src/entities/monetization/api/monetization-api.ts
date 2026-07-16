import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type {
  CreateBookingInput,
  PaymentRecord,
  PremiumPlan,
  PromoAd,
  VenueBooking,
  Voucher,
} from "../model/types";
import { monetizationMockStore } from "../lib/mock-store";

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
  process.env.NEXT_PUBLIC_MONETIZATION_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_MONETIZATION_MOCK !== "false");

export const monetizationApi = {
  async listPlans(): Promise<{ plans: PremiumPlan[]; currentPlanId: string }> {
    try {
      return await apiClient.get("/monetization/plans");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return {
          plans: monetizationMockStore.listPlans(),
          currentPlanId: monetizationMockStore.getCurrentPlanId(),
        };
      }
      throw err;
    }
  },

  async subscribe(planId: string): Promise<{ currentPlanId: string }> {
    try {
      return await apiClient.post("/monetization/subscribe", { planId });
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        monetizationMockStore.setPlan(planId);
        return { currentPlanId: planId };
      }
      throw err;
    }
  },

  async listVouchers(): Promise<Voucher[]> {
    try {
      return await apiClient.get("/monetization/vouchers");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return monetizationMockStore.listVouchers();
      }
      throw err;
    }
  },

  async redeemVoucher(id: string): Promise<Voucher> {
    try {
      return await apiClient.post(`/monetization/vouchers/${id}/redeem`);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return monetizationMockStore.redeemVoucher(id);
      }
      throw err;
    }
  },

  async listBookings(): Promise<VenueBooking[]> {
    try {
      return await apiClient.get("/monetization/bookings");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return monetizationMockStore.listBookings();
      }
      throw err;
    }
  },

  async createBooking(input: CreateBookingInput): Promise<VenueBooking> {
    try {
      return await apiClient.post("/monetization/bookings", input);
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return monetizationMockStore.createBooking(input);
      }
      throw err;
    }
  },

  async listPayments(): Promise<PaymentRecord[]> {
    try {
      return await apiClient.get("/monetization/payments");
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return monetizationMockStore.listPayments();
      }
      throw err;
    }
  },

  async listAds(placement: PromoAd["placement"] = "home"): Promise<PromoAd[]> {
    try {
      return await apiClient.get("/monetization/ads", {
        params: { placement },
      });
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        return monetizationMockStore.listAds(placement);
      }
      throw err;
    }
  },
};

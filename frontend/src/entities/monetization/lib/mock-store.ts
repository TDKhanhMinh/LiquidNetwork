import type {
  CreateBookingInput,
  PaymentRecord,
  PremiumPlan,
  PromoAd,
  VenueBooking,
  Voucher,
} from "../model/types";
import { routes } from "@/shared/config/routes";

const BOOKINGS_KEY = "ln.bookings";
const VOUCHERS_KEY = "ln.vouchers";
const PAYMENTS_KEY = "ln.payments";
const PLAN_KEY = "ln.premium_plan";

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    currency: "VND",
    features: [
      "Queue cơ bản",
      "Chat 1-1",
      "Safe Ride",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    priceMonthly: 79000,
    currency: "VND",
    features: [
      "Ưu tiên matchmaking",
      "Bộ lọc nâng cao",
      "Ẩn quảng cáo",
      "Voucher hàng tháng",
    ],
    highlighted: true,
  },
  {
    id: "vip",
    name: "VIP",
    priceMonthly: 199000,
    currency: "VND",
    features: [
      "Tất cả Plus",
      "Đặt bàn ưu tiên",
      "Badge VIP trên hồ sơ",
      "Support 24/7",
    ],
  },
];

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: "v1",
    code: "WELCOME50",
    title: "Welcome 50K",
    description: "Giảm 50.000đ cho lần đặt bàn đầu.",
    discountLabel: "-50K",
    expiresAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
    used: false,
  },
  {
    id: "v2",
    code: "SAFE10",
    title: "Safe Ride 10%",
    description: "Giảm 10% chuyến xe về nhà (đối tác).",
    discountLabel: "-10%",
    expiresAt: new Date(Date.now() + 14 * 86400_000).toISOString(),
    used: false,
  },
  {
    id: "v3",
    code: "PLUSFREE",
    title: "Plus 7 ngày",
    description: "Dùng thử gói Plus miễn phí 7 ngày.",
    discountLabel: "Trial",
    expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    used: true,
  },
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay1",
    title: "Plus · tháng 6",
    amount: 79000,
    currency: "VND",
    status: "paid",
    method: "MoMo",
    createdAt: new Date(Date.now() - 20 * 86400_000).toISOString(),
  },
  {
    id: "pay2",
    title: "Đặt bàn Bia Craft",
    amount: 200000,
    currency: "VND",
    status: "paid",
    method: "Visa",
    createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
  },
];

export const HOME_ADS: PromoAd[] = [
  {
    id: "ad-premium",
    title: "Nâng Plus — match nhanh hơn",
    body: "Bộ lọc nâng cao + voucher mỗi tháng.",
    ctaLabel: "Xem gói",
    href: routes.premium,
    placement: "home",
  },
  {
    id: "ad-venue",
    title: "Đặt bàn quanh bạn",
    body: "Quán craft beer Q1 · giữ chỗ online.",
    ctaLabel: "Đặt bàn",
    href: routes.bookingNew,
    placement: "home",
  },
];

export const monetizationMockStore = {
  listPlans(): PremiumPlan[] {
    return PREMIUM_PLANS;
  },

  getCurrentPlanId(): string {
    return readJson(PLAN_KEY, "free");
  },

  setPlan(planId: string) {
    writeJson(PLAN_KEY, planId);
    const payments = this.listPayments();
    const plan = PREMIUM_PLANS.find((p) => p.id === planId);
    if (plan && plan.priceMonthly > 0) {
      payments.unshift({
        id: id("pay"),
        title: `${plan.name} · subscription`,
        amount: plan.priceMonthly,
        currency: plan.currency,
        status: "paid",
        method: "Mock Pay",
        createdAt: nowIso(),
      });
      writeJson(PAYMENTS_KEY, payments);
    }
  },

  listVouchers(): Voucher[] {
    const stored = readJson<Voucher[] | null>(VOUCHERS_KEY, null);
    if (!stored) {
      writeJson(VOUCHERS_KEY, DEFAULT_VOUCHERS);
      return DEFAULT_VOUCHERS;
    }
    return stored;
  },

  redeemVoucher(voucherId: string): Voucher {
    const list = this.listVouchers();
    const idx = list.findIndex((v) => v.id === voucherId);
    if (idx < 0) throw new Error("Voucher not found");
    list[idx] = { ...list[idx]!, used: true };
    writeJson(VOUCHERS_KEY, list);
    return list[idx]!;
  },

  listBookings(): VenueBooking[] {
    return readJson<VenueBooking[]>(BOOKINGS_KEY, []).sort((a, b) =>
      b.reservedAt.localeCompare(a.reservedAt),
    );
  },

  createBooking(input: CreateBookingInput): VenueBooking {
    const booking: VenueBooking = {
      id: id("bk"),
      venueName: input.venueName.trim(),
      address: input.address.trim(),
      partySize: input.partySize,
      reservedAt: input.reservedAt,
      status: "confirmed",
      note: input.note?.trim(),
      createdAt: nowIso(),
    };
    const list = this.listBookings();
    list.unshift(booking);
    writeJson(BOOKINGS_KEY, list);
    return booking;
  },

  listPayments(): PaymentRecord[] {
    const stored = readJson<PaymentRecord[] | null>(PAYMENTS_KEY, null);
    if (!stored) {
      writeJson(PAYMENTS_KEY, DEFAULT_PAYMENTS);
      return DEFAULT_PAYMENTS;
    }
    return stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listAds(placement: PromoAd["placement"] = "home"): PromoAd[] {
    return HOME_ADS.filter((a) => a.placement === placement);
  },
};

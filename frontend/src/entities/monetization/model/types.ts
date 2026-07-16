export type PremiumTier = "free" | "plus" | "vip";

export interface PremiumPlan {
  id: PremiumTier;
  name: string;
  priceMonthly: number;
  currency: string;
  features: string[];
  highlighted?: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountLabel: string;
  expiresAt: string;
  used: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface VenueBooking {
  id: string;
  venueName: string;
  address: string;
  partySize: number;
  reservedAt: string;
  status: BookingStatus;
  note?: string;
  createdAt: string;
}

export interface CreateBookingInput {
  venueName: string;
  address: string;
  partySize: number;
  reservedAt: string;
  note?: string;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface PaymentRecord {
  id: string;
  title: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  createdAt: string;
}

export interface PromoAd {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  placement: "home" | "discover" | "session";
}

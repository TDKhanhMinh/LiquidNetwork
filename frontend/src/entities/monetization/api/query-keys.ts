export const monetizationKeys = {
  all: ["monetization"] as const,
  plans: () => [...monetizationKeys.all, "plans"] as const,
  vouchers: () => [...monetizationKeys.all, "vouchers"] as const,
  bookings: () => [...monetizationKeys.all, "bookings"] as const,
  payments: () => [...monetizationKeys.all, "payments"] as const,
  ads: (placement: string) =>
    [...monetizationKeys.all, "ads", placement] as const,
};

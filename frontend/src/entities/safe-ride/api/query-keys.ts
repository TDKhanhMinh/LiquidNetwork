export const safeRideKeys = {
  all: ["safe-ride"] as const,
  fines: () => [...safeRideKeys.all, "fines"] as const,
  rides: () => [...safeRideKeys.all, "rides"] as const,
  prefs: () => [...safeRideKeys.all, "prefs"] as const,
};

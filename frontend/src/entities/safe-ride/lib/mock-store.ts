import type {
  CreateRideInput,
  RideProvider,
  RideRequest,
  SafeRidePrefs,
} from "../model/types";

const RIDES_KEY = "ln.safe_rides";
const PREFS_KEY = "ln.safe_ride_prefs";

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

function id() {
  return `ride_${Math.random().toString(36).slice(2, 10)}`;
}

export const safeRideMockStore = {
  listRides(): RideRequest[] {
    return readJson<RideRequest[]>(RIDES_KEY, []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  requestRide(input: CreateRideInput): RideRequest {
    const ride: RideRequest = {
      id: id(),
      provider: input.provider,
      status: "requested",
      fromLabel: input.fromLabel ?? "Vị trí hiện tại",
      toLabel: input.toLabel ?? "Nhà",
      createdAt: nowIso(),
      completedAt: null,
    };
    const rides = this.listRides();
    rides.unshift(ride);
    writeJson(RIDES_KEY, rides);
    return ride;
  },

  completeRide(rideId: string): RideRequest {
    const rides = this.listRides();
    const idx = rides.findIndex((r) => r.id === rideId);
    if (idx < 0) throw new Error("Ride not found");
    rides[idx] = {
      ...rides[idx]!,
      status: "completed",
      completedAt: nowIso(),
    };
    writeJson(RIDES_KEY, rides);
    return rides[idx]!;
  },

  getPrefs(): SafeRidePrefs {
    return readJson<SafeRidePrefs>(PREFS_KEY, {
      preferredProvider: "grab",
    });
  },

  setPrefs(prefs: Partial<SafeRidePrefs>): SafeRidePrefs {
    const next = { ...this.getPrefs(), ...prefs };
    writeJson(PREFS_KEY, next);
    return next;
  },

  deepLink(provider: RideProvider): string {
    switch (provider) {
      case "xanh_sm":
        return "https://www.xanhsm.com/";
      case "grab":
        return "https://www.grab.com/vn/";
      case "gojek":
        return "https://www.gojek.com/vn/";
      case "buddy_drive":
        return "/safe-ride";
      default:
        return "/safe-ride";
    }
  },
};

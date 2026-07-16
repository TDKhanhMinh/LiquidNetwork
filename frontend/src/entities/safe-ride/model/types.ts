export type RideProvider = "xanh_sm" | "grab" | "gojek" | "buddy_drive";

export type RideStatus = "requested" | "completed" | "cancelled";

export interface FineBand {
  id: string;
  bloodAlcohol: string;
  vehicle: string;
  fineRange: string;
  licenseAction: string;
}

export interface RideRequest {
  id: string;
  provider: RideProvider;
  status: RideStatus;
  fromLabel: string;
  toLabel?: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface SafeRidePrefs {
  preferredProvider: RideProvider;
}

export interface CreateRideInput {
  provider: RideProvider;
  fromLabel?: string;
  toLabel?: string;
}

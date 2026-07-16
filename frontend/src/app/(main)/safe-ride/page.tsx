"use client";

import { SafeRideScreen } from "@/features/safe-ride";
import { SafeRideInterstitialGate } from "@/features/safe-ride-ad";

export default function SafeRidePage() {
  return (
    <SafeRideInterstitialGate>
      <SafeRideScreen />
    </SafeRideInterstitialGate>
  );
}

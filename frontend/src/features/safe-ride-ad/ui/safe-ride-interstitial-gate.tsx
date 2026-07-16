"use client";

import type { ReactNode } from "react";
import { SAFE_RIDE_INTERSTITIAL_SESSION_KEY } from "@/shared/lib/interstitial-session-storage";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { InterstitialAd } from "@/shared/ui/interstitial-ad";
import { SafeRideAdCreative } from "./safe-ride-ad-creative";

export type SafeRideInterstitialGateProps = {
  children: ReactNode;
  /** Override countdown length (seconds). Default: 10. */
  durationSeconds?: number;
  /**
   * sessionStorage id for once-per-tab-session. Default: Safe Ride key.
   * Pass `undefined` only if you intentionally want every visit (not recommended).
   */
  sessionKey?: string | false;
  /** Custom ad creative; defaults to SafeRideAdCreative. */
  ad?: ReactNode;
  onClose?: () => void;
  onSkip?: () => void;
};

/**
 * Safe Ride page gate: shows a full-screen interstitial before the fines table
 * and ride actions. Auto-closes after 10s or when the user skips.
 * Shown at most once per browser tab session.
 */
export function SafeRideInterstitialGate({
  children,
  durationSeconds = 10,
  sessionKey = SAFE_RIDE_INTERSTITIAL_SESSION_KEY,
  ad,
  onClose,
  onSkip,
}: SafeRideInterstitialGateProps) {
  const { t, ready } = useAppTranslation("safe-ride");

  return (
    <InterstitialAd
      durationSeconds={durationSeconds}
      sessionKey={sessionKey === false ? undefined : sessionKey}
      ad={ad ?? <SafeRideAdCreative />}
      skipLabel={ready ? t("ad.skip") : "…"}
      countdownLabel={(s) =>
        ready ? t("ad.countdown", { count: s }) : `${s}s`
      }
      title={ready ? t("ad.title") : "Ad"}
      onClose={onClose}
      onSkip={onSkip}
    >
      {children}
    </InterstitialAd>
  );
}

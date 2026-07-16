"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/shared/api";
import { routes } from "@/shared/config";
import {
  isOnboardingDone,
  isProfileSetupDone,
} from "@/shared/lib/onboarding-storage";

/** Logged-in visitors hitting `/` skip marketing and enter the app. */
export function LandingAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) return;
    if (!isOnboardingDone()) {
      router.replace(routes.onboarding);
      return;
    }
    if (!isProfileSetupDone()) {
      router.replace(routes.setupProfile);
      return;
    }
    router.replace(routes.home);
  }, [router]);

  return null;
}

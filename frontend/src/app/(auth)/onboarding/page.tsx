"use client";

import { AuthGate } from "@/features/auth-guard";
import { OnboardingCarousel } from "@/features/auth-onboarding";

export default function OnboardingPage() {
  return (
    <AuthGate mode="onboarding">
      <OnboardingCarousel />
    </AuthGate>
  );
}

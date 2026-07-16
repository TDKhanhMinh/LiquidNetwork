import { routes } from "@/shared/config";
import {
  isOnboardingDone,
  isProfileSetupDone,
} from "@/shared/lib/onboarding-storage";

/** Where to land after a successful sign-in / register */
export function getPostAuthPath(): string {
  if (!isOnboardingDone()) return routes.onboarding;
  if (!isProfileSetupDone()) return routes.setupProfile;
  return routes.home;
}

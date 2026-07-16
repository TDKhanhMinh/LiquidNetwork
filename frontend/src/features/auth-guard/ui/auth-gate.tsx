"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { env, routes } from "@/shared/config";
import { Spinner } from "@/shared/ui/spinner";
import { useAuthStatus } from "../hook/use-auth-status";

export type AuthGateMode =
  /** Main app: token + onboarding + profile setup required */
  | "app"
  /** Requires access token only */
  | "authenticated"
  /** Onboarding flow: token required; skip if already done */
  | "onboarding"
  /** First-time profile: token + onboarding; skip if already done */
  | "setup-profile"
  /** Guest-only screens (login / register) */
  | "guest"
  /** Public — no redirect */
  | "public";

interface AuthGateProps {
  children: ReactNode;
  mode?: AuthGateMode;
}

function GateLoading() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Spinner className="size-6" />
      </div>
    </div>
  );
}

function nextDestination(
  onboardingDone: boolean,
  profileSetupDone: boolean,
): string {
  if (!onboardingDone) return routes.onboarding;
  if (!profileSetupDone) return routes.setupProfile;
  return routes.home;
}

/**
 * Client auth redirects for localStorage-based sessions.
 *
 * Flow after login:
 * 1. Onboarding (once) → 2. Setup profile (once) → 3. App home
 */
export function AuthGate({ children, mode = "app" }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const {
    hydrated,
    isAuthenticated,
    onboardingDone,
    profileSetupDone,
  } = useAuthStatus();

  useEffect(() => {
    if (!hydrated || mode === "public") return;

    if (mode === "guest") {
      if (isAuthenticated) {
        router.replace(nextDestination(onboardingDone, profileSetupDone));
      }
      return;
    }

    if (mode === "authenticated") {
      if (!isAuthenticated) {
        router.replace(`${env.loginPath}?next=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    if (mode === "onboarding") {
      if (!isAuthenticated) {
        router.replace(env.loginPath);
        return;
      }
      if (onboardingDone) {
        router.replace(nextDestination(true, profileSetupDone));
      }
      return;
    }

    if (mode === "setup-profile") {
      if (!isAuthenticated) {
        router.replace(env.loginPath);
        return;
      }
      if (!onboardingDone) {
        router.replace(routes.onboarding);
        return;
      }
      if (profileSetupDone) {
        router.replace(routes.home);
      }
      return;
    }

    // mode === "app" — all main routes require full session
    if (!isAuthenticated) {
      router.replace(`${env.loginPath}?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!onboardingDone) {
      router.replace(routes.onboarding);
      return;
    }

    if (!profileSetupDone) {
      router.replace(routes.setupProfile);
    }
  }, [
    hydrated,
    isAuthenticated,
    mode,
    onboardingDone,
    pathname,
    profileSetupDone,
    router,
  ]);

  if (!hydrated) {
    return <GateLoading />;
  }

  if (mode === "guest" && isAuthenticated) {
    return <GateLoading />;
  }

  if (mode === "authenticated" && !isAuthenticated) {
    return <GateLoading />;
  }

  if (mode === "onboarding") {
    if (!isAuthenticated || onboardingDone) return <GateLoading />;
  }

  if (mode === "setup-profile") {
    if (!isAuthenticated || !onboardingDone || profileSetupDone) {
      return <GateLoading />;
    }
  }

  if (mode === "app") {
    if (!isAuthenticated) {
      return <GateLoading />;
    }
    if (!onboardingDone || !profileSetupDone) {
      return <GateLoading />;
    }
  }

  return <>{children}</>;
}

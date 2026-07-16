"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListOrderedIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { notifyAuthChanged } from "@/shared/lib/auth-events";
import { setOnboardingDone } from "@/shared/lib/onboarding-storage";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const STEPS: { icon: LucideIcon; titleKey: string; bodyKey: string }[] = [
  {
    icon: ListOrderedIcon,
    titleKey: "onboarding.step1Title",
    bodyKey: "onboarding.step1Body",
  },
  {
    icon: UserRoundIcon,
    titleKey: "onboarding.step2Title",
    bodyKey: "onboarding.step2Body",
  },
  {
    icon: ShieldCheckIcon,
    titleKey: "onboarding.step3Title",
    bodyKey: "onboarding.step3Body",
  },
];

/**
 * Product value intro — multi-step, mobile-first, Night Amber.
 */
export function OnboardingCarousel() {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["auth", "common"]);
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const isLast = step === total - 1;
  const current = STEPS[step]!;
  const Icon = current.icon;

  function finishOnboarding() {
    setOnboardingDone(true);
    notifyAuthChanged();
    router.replace(routes.setupProfile);
  }

  if (!ready) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {t("common:tagline")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("onboarding.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("onboarding.subtitle")}</p>
      </div>

      <div
        key={step}
        className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-amber-glow ring-1 ring-primary/15"
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="size-8" aria-hidden />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            {t(current.titleKey)}
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            {t(current.bodyKey)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2" role="tablist">
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === step}
            aria-label={t("onboarding.stepIndicator", {
              current: i + 1,
              total,
            })}
            onClick={() => setStep(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40",
            )}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("onboarding.stepIndicator", { current: step + 1, total })}
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-12 flex-1 rounded-xl"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {t("onboarding.back")}
            </Button>
          ) : null}
          <Button
            type="button"
            className="min-h-12 flex-1 rounded-xl text-base font-semibold"
            onClick={() => {
              if (isLast) finishOnboarding();
              else setStep((s) => s + 1);
            }}
          >
            {isLast ? t("onboarding.cta") : t("onboarding.next")}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full rounded-xl"
          onClick={finishOnboarding}
        >
          {t("onboarding.skip")}
        </Button>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

type AuthShellProps = {
  children: ReactNode;
};

/**
 * Night Amber auth chrome — mobile-first, full-bleed, no main app header.
 * Soft amber ambient glow (not heavy black shadow).
 */
export function AuthShell({ children }: AuthShellProps) {
  const { t } = useAppTranslation("common");

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-background">
      {/* Ambient night-amber atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_srgb,var(--primary)_22%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 size-[min(100vw,28rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--secondary)_35%,transparent),transparent)] blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-base font-semibold tracking-tight text-foreground transition-opacity active:opacity-80"
        >
          <span
            aria-hidden
            className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-amber-glow"
          >
            LN
          </span>
          <span>{t("appName")}</span>
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-2 md:px-6 md:pb-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

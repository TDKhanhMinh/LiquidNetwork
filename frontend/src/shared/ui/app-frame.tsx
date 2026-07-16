import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type AppFrameProps = {
  children: ReactNode;
  className?: string;
  /**
   * When true, only renders children (e.g. marketing already owns layout).
   */
  fullBleed?: boolean;
};

/**
 * Full-width app stage (Night Amber Social) — PC/Laptop first.
 *
 * Shell is **always 100% viewport width** (no max-w column).
 * Ambient amber/indigo sits behind content; chrome + pages fill the screen.
 */
export function AppFrame({
  children,
  className,
  fullBleed = false,
}: AppFrameProps) {
  if (fullBleed) {
    return <>{children}</>;
  }

  return (
    <div
      data-slot="app-frame"
      className={cn(
        "relative flex min-h-dvh w-full flex-col overflow-x-clip",
        "bg-background text-foreground",
        className,
      )}
    >
      {/* Ambient — full viewport, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(245,158,11,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_80%,rgba(49,46,129,0.2),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_0%_70%,rgba(245,158,11,0.05),transparent_50%)]" />
      </div>

      <div data-slot="app-frame-content" className="relative z-10 flex min-h-dvh w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import {
  isInterstitialSeen,
  markInterstitialSeen,
} from "@/shared/lib/interstitial-session-storage";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const DEFAULT_DURATION_SECONDS = 10;
const EXIT_MS = 280;

export type InterstitialAdProps = {
  /**
   * Main page content — rendered only after the ad is dismissed
   * (auto timeout or skip).
   */
  children: ReactNode;
  /** Ad creative (image, video, copy, CTA, …). */
  ad: ReactNode;
  /** Countdown length in seconds. Default: 10. */
  durationSeconds?: number;
  /**
   * Controlled open state. When omitted, opens on mount
   * (or when `defaultOpen` is true), subject to `sessionKey`.
   */
  open?: boolean;
  /** Uncontrolled initial open. Default: true. */
  defaultOpen?: boolean;
  /**
   * When set, show at most once per browser tab session
   * (`sessionStorage` key `ln.interstitial.{sessionKey}`).
   */
  sessionKey?: string;
  /** Fires when the ad fully closes (after exit animation). */
  onClose?: () => void;
  /** Fires when the user taps skip (before close animation). */
  onSkip?: () => void;
  /** Label for the skip control. */
  skipLabel?: string;
  /**
   * Accessible countdown text. Receives remaining whole seconds.
   * Example: (s) => `Đóng sau ${s}s`
   */
  countdownLabel?: (secondsLeft: number) => string;
  /** Optional title for accessibility (sr / aria). */
  title?: string;
  className?: string;
  /** Overlay panel className (content card). */
  contentClassName?: string;
};

type Phase = "hydrating" | "open" | "closing" | "closed";

/**
 * Full-viewport interstitial ad gate.
 *
 * - Auto-dismisses after `durationSeconds` (default 10).
 * - Skip button / Escape closes early.
 * - Locks body scroll while open.
 * - Renders `children` only after the ad is gone.
 * - Optional `sessionKey`: once per browser tab session.
 */
export function InterstitialAd({
  children,
  ad,
  durationSeconds = DEFAULT_DURATION_SECONDS,
  open: openControlled,
  defaultOpen = true,
  sessionKey,
  onClose,
  onSkip,
  skipLabel = "Skip ad",
  countdownLabel = (s) => `${s}s`,
  title = "Advertisement",
  className,
  contentClassName,
}: InterstitialAdProps) {
  const titleId = useId();
  const isControlled = openControlled !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    () => defaultOpen && !sessionKey,
  );
  const isOpen = isControlled ? Boolean(openControlled) : uncontrolledOpen;

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [phase, setPhase] = useState<Phase>(() =>
    sessionKey ? "hydrating" : defaultOpen ? "open" : "closed",
  );
  const [mounted, setMounted] = useState(false);

  const closingRef = useRef(false);
  const phaseRef = useRef(phase);
  const onCloseRef = useRef(onClose);
  const onSkipRef = useRef(onSkip);
  const sessionKeyRef = useRef(sessionKey);
  const hydratedOnceRef = useRef(false);

  phaseRef.current = phase;
  onCloseRef.current = onClose;
  onSkipRef.current = onSkip;
  sessionKeyRef.current = sessionKey;

  const finishClose = useCallback(() => {
    const key = sessionKeyRef.current;
    if (key) markInterstitialSeen(key);
    if (!isControlled) setUncontrolledOpen(false);
    setPhase("closed");
    closingRef.current = false;
    onCloseRef.current?.();
  }, [isControlled]);

  const beginClose = useCallback(() => {
    const current = phaseRef.current;
    if (closingRef.current || current === "closed" || current === "hydrating") {
      return;
    }
    closingRef.current = true;
    setPhase("closing");
  }, []);

  // Client mount + session gate (run once per mount / sessionKey)
  useEffect(() => {
    setMounted(true);

    if (isControlled) {
      hydratedOnceRef.current = true;
      if (sessionKey && isInterstitialSeen(sessionKey) && openControlled) {
        setPhase("closed");
        return;
      }
      setPhase(openControlled ? "open" : "closed");
      return;
    }

    if (sessionKey) {
      if (isInterstitialSeen(sessionKey)) {
        setUncontrolledOpen(false);
        setPhase("closed");
      } else {
        setUncontrolledOpen(true);
        setPhase("open");
        setSecondsLeft(durationSeconds);
        closingRef.current = false;
      }
      hydratedOnceRef.current = true;
      return;
    }

    setPhase(defaultOpen ? "open" : "closed");
    setUncontrolledOpen(defaultOpen);
    hydratedOnceRef.current = true;
    // Only re-hydrate when session identity / control mode changes — not every duration tweak mid-flight
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount/session gate
  }, [sessionKey, isControlled]);

  // Controlled open changes after hydrate
  useEffect(() => {
    if (!isControlled || !hydratedOnceRef.current) return;
    if (sessionKey && isInterstitialSeen(sessionKey)) {
      setPhase("closed");
      return;
    }
    if (openControlled) {
      closingRef.current = false;
      setPhase("open");
      setSecondsLeft(durationSeconds);
    } else if (phaseRef.current === "open") {
      beginClose();
    }
  }, [isControlled, openControlled, sessionKey, durationSeconds, beginClose]);

  // Exit animation → unmount overlay
  useEffect(() => {
    if (phase !== "closing") return;
    const id = window.setTimeout(finishClose, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [phase, finishClose]);

  // Countdown (stable beginClose via ref — no mid-timer reset)
  useEffect(() => {
    if (phase !== "open") return;

    setSecondsLeft(durationSeconds);
    const started = Date.now();
    const totalMs = Math.max(0, durationSeconds) * 1000;

    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const left = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(tick);
        beginClose();
      }
    }, 200);

    return () => window.clearInterval(tick);
  }, [phase, durationSeconds, beginClose]);

  // Body scroll lock
  useEffect(() => {
    if (phase !== "open" && phase !== "closing") return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouch = body.style.touchAction;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevBodyTouch;
    };
  }, [phase]);

  // Escape to skip
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkipRef.current?.();
        beginClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, beginClose]);

  const handleSkip = () => {
    onSkipRef.current?.();
    beginClose();
  };

  const showOverlay = mounted && (phase === "open" || phase === "closing");
  const isClosing = phase === "closing";
  // Fill progress: 0 → 1 as time elapses
  const progress =
    durationSeconds > 0
      ? Math.min(1, Math.max(0, 1 - secondsLeft / durationSeconds))
      : 1;

  if (phase === "hydrating") {
    return null;
  }

  return (
    <>
      {phase === "closed" ? children : null}

      {showOverlay
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              data-slot="interstitial-ad"
              data-state={isClosing ? "closed" : "open"}
              className={cn(
                "fixed inset-0 z-[200] flex w-full flex-col",
                "bg-background text-foreground",
                "transition-opacity duration-300 ease-out",
                isClosing ? "opacity-0" : "opacity-100 animate-in fade-in-0",
                className,
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,color-mix(in_srgb,var(--primary)_20%,transparent),transparent_65%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_90%_80%,color-mix(in_srgb,var(--secondary)_25%,transparent),transparent_55%)]"
              />

              <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
                <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-6 md:px-8 lg:px-10">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11",
                        "border border-primary/40 bg-primary/15 font-mono text-sm font-bold tabular-nums text-primary sm:text-base",
                        "shadow-amber-glow",
                      )}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {secondsLeft}
                    </span>
                    <div className="min-w-0">
                      <p id={titleId} className="sr-only">
                        {title}
                      </p>
                      <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                        {countdownLabel(secondsLeft)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleSkip}
                    className={cn(
                      "min-h-11 shrink-0 gap-1.5 rounded-xl border-primary/35 bg-card/90 px-4",
                      "text-foreground shadow-amber-glow hover:bg-primary/15 hover:text-foreground",
                    )}
                  >
                    <XIcon className="size-4" aria-hidden />
                    <span className="max-w-[9rem] truncate sm:max-w-none">
                      {skipLabel}
                    </span>
                  </Button>
                </header>

                <div
                  className="mx-4 h-1.5 overflow-hidden rounded-full bg-muted sm:mx-6 md:mx-8 lg:mx-10"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={durationSeconds}
                  aria-valuenow={Math.max(0, durationSeconds - secondsLeft)}
                  aria-label={title}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <div
                  className={cn(
                    "relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain",
                    "px-4 py-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 md:px-8",
                    isClosing
                      ? "animate-out fade-out-0 zoom-out-95"
                      : "animate-in fade-in-0 zoom-in-95",
                    "duration-300",
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto flex w-full max-w-md flex-col sm:max-w-lg lg:max-w-xl",
                      "rounded-2xl border border-border bg-card p-5 shadow-amber-glow ring-1 ring-primary/15",
                      "sm:p-6 md:p-8",
                      contentClassName,
                    )}
                  >
                    {ad}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

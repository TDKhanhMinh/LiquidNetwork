"use client";

import { cn } from "@/shared/lib/utils";

interface CountdownRingProps {
  /** 0–1 remaining fraction */
  progress: number;
  label: string;
  caption?: string;
  className?: string;
}

export function CountdownRing({
  progress,
  label,
  caption,
  className,
}: CountdownRingProps) {
  const size = 168;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = c * (1 - clamped);
  const urgent = clamped < 0.2;

  return (
    <div
      className={cn(
        "relative mx-auto flex size-[168px] items-center justify-center",
        className,
      )}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-200",
            urgent ? "text-destructive" : "text-primary",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-mono text-3xl font-bold tracking-tight",
            urgent ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </span>
        {caption ? (
          <span className="mt-1 text-xs text-muted-foreground">{caption}</span>
        ) : null}
      </div>
    </div>
  );
}

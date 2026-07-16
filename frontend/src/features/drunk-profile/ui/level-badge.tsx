"use client";

import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { cn } from "@/shared/lib/utils";

const LEVEL_STYLES: Record<string, string> = {
  LEVEL_1: "bg-muted text-muted-foreground",
  LEVEL_2: "bg-primary/15 text-primary",
  LEVEL_3: "bg-secondary/50 text-secondary-foreground",
  LEVEL_4: "bg-accent/20 text-accent",
};

interface LevelBadgeProps {
  level?: string | null;
  className?: string;
  showHint?: boolean;
}

export function LevelBadge({ level, className, showHint }: LevelBadgeProps) {
  const { t } = useAppTranslation("user");
  if (!level) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {t("level.unknown")}
      </span>
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-0.5 md:gap-1", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-xl px-3 py-1 text-sm font-semibold md:px-3.5 md:py-1.5 md:text-[0.9375rem]",
          LEVEL_STYLES[level] ?? "bg-muted text-foreground",
        )}
      >
        {t(`level.labels.${level}`, { defaultValue: level })}
      </span>
      {showHint ? (
        <span className="text-xs text-muted-foreground md:text-[0.8125rem]">
          {t(`level.hints.${level}`, { defaultValue: "" })}
        </span>
      ) : null}
    </div>
  );
}

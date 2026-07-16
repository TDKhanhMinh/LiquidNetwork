"use client";

import type { QueueParticipant } from "@/entities/invitation-queue";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ParticipantListProps {
  participants: QueueParticipant[];
  currentIndex: number;
  title?: string;
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  pending: "outline",
  accepted: "secondary",
  rejected: "destructive",
  timeout: "destructive",
  skipped: "outline",
};

export function ParticipantList({
  participants,
  currentIndex,
  title,
}: ParticipantListProps) {
  const { t } = useAppTranslation("invitation-queue");

  return (
    <section className="space-y-2">
      {title ? (
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      ) : null}
      <ul className="space-y-2">
        {participants.map((p, index) => {
          const isCurrent = index === currentIndex && p.status === "active";
          return (
            <li
              key={`${p.userId}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                isCurrent
                  ? "border-primary bg-primary/10 shadow-amber-glow"
                  : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-xs font-bold",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
              </div>
              <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>
                {t(`status.participant.${p.status}`)}
              </Badge>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

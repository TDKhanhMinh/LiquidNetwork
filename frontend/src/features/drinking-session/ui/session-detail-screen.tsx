"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  Loader2Icon,
  MapPinIcon,
  StarIcon,
  UserPlusIcon,
} from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import {
  useSessionActions,
  useSessionDetail,
} from "../hook/use-sessions";

interface SessionDetailScreenProps {
  sessionId: string;
}

export function SessionDetailScreen({ sessionId }: SessionDetailScreenProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["drinking-session", "common"]);
  const { data: session, isLoading, isError, refetch } =
    useSessionDetail(sessionId);
  const actions = useSessionActions(sessionId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showEnd, setShowEnd] = useState(false);

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !session) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const active =
    session.status === "scheduled" || session.status === "live";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {session.title}
          </h1>
          <Badge>{t(`status.${session.status}`)}</Badge>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon className="size-4" />
          {session.location}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(session.startTime).toLocaleString()}
        </p>
        {session.note ? (
          <p className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
            {session.note}
          </p>
        ) : null}
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{t("detail.participants")}</h2>
        <ul className="space-y-2">
          {session.participants.map((p) => (
            <li
              key={p.userId}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
            >
              <span className="font-medium">{p.name}</span>
              <Badge variant="outline">
                {t(`participant.${p.status}`)}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      {active ? (
        <div className="grid gap-2">
          <Button
            type="button"
            className="min-h-12 rounded-xl"
            disabled={actions.checkIn.isPending}
            onClick={() => actions.checkIn.mutate()}
          >
            {actions.checkIn.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CheckIcon />
            )}
            {t("detail.checkIn")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl"
            disabled={actions.invite.isPending}
            onClick={() =>
              actions.invite.mutate({ userIds: ["u-vy", "u-duc"] })
            }
          >
            {actions.invite.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <UserPlusIcon />
            )}
            {t("detail.inviteMore")}
          </Button>

          {!showEnd ? (
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 rounded-xl"
              onClick={() => setShowEnd(true)}
            >
              {t("detail.end")}
            </Button>
          ) : (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">{t("detail.endTitle")}</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const v = i + 1;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRating(v)}
                      className="rounded-lg p-1"
                    >
                      <StarIcon
                        className={
                          v <= rating
                            ? "size-6 fill-primary text-primary"
                            : "size-6 text-muted-foreground/40"
                        }
                      />
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-c">{t("detail.endComment")}</Label>
                <Textarea
                  id="end-c"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-20 rounded-xl"
                />
              </div>
              <Button
                type="button"
                className="min-h-11 w-full rounded-xl"
                disabled={actions.end.isPending}
                onClick={async () => {
                  await actions.end.mutateAsync({
                    rating,
                    comment: comment.trim() || undefined,
                  });
                  setShowEnd(false);
                }}
              >
                {actions.end.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : null}
                {t("detail.confirmEnd")}
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl text-destructive"
            disabled={actions.cancel.isPending}
            onClick={async () => {
              await actions.cancel.mutateAsync();
              router.replace(routes.sessions);
            }}
          >
            {t("detail.cancel")}
          </Button>
        </div>
      ) : (
        <Link
          href={routes.safeRide}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("detail.safeRideCta")}
        </Link>
      )}

      <Link
        href={routes.sessions}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "min-h-11 rounded-xl",
        )}
      >
        {t("common:actions.back")}
      </Link>
    </div>
  );
}

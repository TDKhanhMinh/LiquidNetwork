"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  Loader2Icon,
  RadioIcon,
  XIcon,
} from "lucide-react";
import { getAccessToken } from "@/shared/api";
import { env, routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useCountdown } from "../hook/use-countdown";
import { useQueueById } from "../hook/use-queue-by-id";
import {
  useCancelQueue,
  useRespondToQueue,
} from "../hook/use-queue-actions";
import { CountdownRing } from "./countdown-ring";
import { ParticipantList } from "./participant-list";

function mockUserId(): string {
  const token = getAccessToken() ?? "";
  if (token.startsWith("mock.")) return "mock-user";
  if (!token) return "me";
  return `user_${token.slice(-8)}`;
}

interface QueueLiveScreenProps {
  queueId: string;
}

export function QueueLiveScreen({ queueId }: QueueLiveScreenProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["invitation-queue", "common"]);
  const { data: queue, isLoading, isError, refetch } = useQueueById(queueId);
  const respond = useRespondToQueue();
  const cancel = useCancelQueue();

  const current = queue?.participants[queue.currentIndex];
  const { remainingMs, label, isExpired } = useCountdown(
    queue?.status === "active" ? queue.expiresAt : null,
  );

  const progress =
    queue && queue.timeoutSeconds > 0
      ? remainingMs / (queue.timeoutSeconds * 1000)
      : 0;

  const me = mockUserId();
  const isHost = queue?.hostId === me;
  const isCurrentInvitee =
    current?.userId === me && current?.status === "active";
  /** Mock/demo: host can drive Accept/Reject to walk the sequential flow */
  const canRespond =
    queue?.status === "active" &&
    (isCurrentInvitee || (env.queueMock && isHost));

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !queue) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const finished =
    queue.status === "completed" ||
    queue.status === "matched" ||
    queue.status === "cancelled";

  return (
    <div className="page-shell gap-6 md:gap-7">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1 md:space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {t("live.title")}
            </h1>
            {queue.status === "active" ? (
              <Badge className="gap-1">
                <RadioIcon className="size-3 animate-pulse" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">
                {t(`status.queue.${queue.status}`)}
              </Badge>
            )}
          </div>
          <p className="page-subtitle">
            {queue.title || t("live.defaultTitle")}
          </p>
        </div>
      </header>

      {/* Current invitee + countdown */}
      <section className="rounded-2xl border border-border bg-card px-4 py-6 text-center shadow-amber-glow ring-1 ring-primary/10 md:px-5 md:py-8">
        <p className="text-xs font-medium tracking-wide text-primary uppercase md:text-[0.8125rem]">
          {t("live.currentInvitee")}
        </p>
        <div className="mt-3 flex flex-col items-center gap-2 md:mt-4 md:gap-2.5">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary md:size-[4.5rem] md:text-3xl">
            {(current?.name ?? "?").slice(0, 1)}
          </span>
          <h2 className="text-lg font-semibold md:text-xl">
            {current?.name ?? t("live.noCurrent")}
          </h2>
          {queue.message ? (
            <p className="max-w-xs text-sm text-muted-foreground md:text-[0.9375rem]">
              {queue.message}
            </p>
          ) : null}
        </div>

        {queue.status === "active" ? (
          <div className="mt-6 md:mt-8">
            <CountdownRing
              progress={progress}
              label={isExpired ? "00:00" : label}
              caption={t("live.countdown")}
            />
            <p className="mt-3 text-sm text-muted-foreground md:text-[0.9375rem]">
              {isCurrentInvitee
                ? t("live.youAreInvited")
                : isHost
                  ? t("live.waiting")
                  : t("live.waiting")}
            </p>
          </div>
        ) : (
          <p className="mt-6 text-sm font-medium text-foreground md:text-base">
            {queue.status === "matched"
              ? t("live.matched")
              : queue.status === "cancelled"
                ? t("live.cancelled")
                : t("live.finished")}
          </p>
        )}
      </section>

      {/* Actions */}
      {canRespond ? (
        <div className="space-y-2 md:space-y-3">
          {env.queueMock && isHost && !isCurrentInvitee ? (
            <p className="text-center text-xs text-primary md:text-sm">
              {t("live.demoRespondHint")}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-12 rounded-xl border-destructive/50 text-destructive md:min-h-[3.25rem]"
              disabled={respond.isPending}
              onClick={() =>
                respond.mutate({ queueId: queue.id, accept: false })
              }
            >
              {respond.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <XIcon />
              )}
              {t("live.reject")}
            </Button>
            <Button
              type="button"
              className="min-h-12 rounded-xl"
              disabled={respond.isPending}
              onClick={() =>
                respond.mutate({ queueId: queue.id, accept: true })
              }
            >
              {respond.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CheckIcon />
              )}
              {t("live.accept")}
            </Button>
          </div>
        </div>
      ) : null}

      {queue.status === "active" && isHost ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-xl"
          disabled={cancel.isPending}
          onClick={async () => {
            await cancel.mutateAsync(queue.id);
            router.replace(routes.queue);
          }}
        >
          {cancel.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          {t("live.cancelQueue")}
        </Button>
      ) : null}

      {finished ? (
        <Link
          href={routes.queue}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("live.backToHub")}
        </Link>
      ) : null}

      <ParticipantList
        participants={queue.participants}
        currentIndex={queue.currentIndex}
        title={t("live.remaining")}
      />

      <p className="text-center text-[11px] text-muted-foreground">
        {t("live.realtimeHint")}
      </p>
    </div>
  );
}

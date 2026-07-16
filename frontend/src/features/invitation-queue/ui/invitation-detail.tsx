"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useInvitationDetail } from "../hook/use-invitation-detail";
import { useCountdown } from "../hook/use-countdown";

interface InvitationDetailProps {
  invitationId: string;
}

export function InvitationDetail({ invitationId }: InvitationDetailProps) {
  const { t, ready } = useAppTranslation(["invitation-queue", "common"]);
  const { data, isLoading, isError, refetch } =
    useInvitationDetail(invitationId);
  const { label } = useCountdown(
    data?.status === "pending" ? data.expiresAt : null,
  );

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !data) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("detail.title")}
        </h1>
        <Badge variant="outline">
          {t(`status.invitation.${data.status}`)}
        </Badge>
      </header>

      <dl className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("detail.from")}</dt>
          <dd className="font-medium">{data.fromUserName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("detail.to")}</dt>
          <dd className="font-medium">{data.toUserName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("detail.timeout")}</dt>
          <dd className="font-mono">{data.timeoutSeconds}s</dd>
        </div>
        {data.status === "pending" ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("live.countdown")}</dt>
            <dd className="font-mono font-semibold text-primary">{label}</dd>
          </div>
        ) : null}
        {data.message ? (
          <div>
            <dt className="text-muted-foreground">{t("detail.message")}</dt>
            <dd className="mt-1 font-medium">{data.message}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("detail.createdAt")}</dt>
          <dd className="text-xs">
            {new Date(data.createdAt).toLocaleString()}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <Link
          href={routes.queueLive(data.queueId)}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("detail.openQueue")}
        </Link>
        <Link
          href={routes.queueHistory}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("common:actions.back")}
        </Link>
      </div>
    </div>
  );
}

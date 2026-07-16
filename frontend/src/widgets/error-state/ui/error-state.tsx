"use client";

import Link from "next/link";
import {
  BanIcon,
  FileQuestionIcon,
  HomeIcon,
  LockIcon,
  LogInIcon,
  RefreshCwIcon,
  ServerCrashIcon,
} from "lucide-react";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { env } from "@/shared/config";
import { Button, buttonVariants } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { cn } from "@/shared/lib/utils";
import type { ErrorStateProps } from "../model/types";

const ICONS = {
  "not-found": FileQuestionIcon,
  forbidden: BanIcon,
  unauthorized: LockIcon,
  server: ServerCrashIcon,
  generic: ServerCrashIcon,
} as const;

/**
 * Shared error presentation for HTTP / auth / runtime failures.
 * Used by app/not-found, forbidden, unauthorized, error boundaries.
 */
export function ErrorState({ kind, digest, onRetry }: ErrorStateProps) {
  const { t, ready } = useAppTranslation("common");
  const Icon = ICONS[kind];
  const prefix = `errors.${kind}`;

  const code = ready ? t(`${prefix}.code`) : "…";
  const title = ready ? t(`${prefix}.title`) : "…";
  const description = ready ? t(`${prefix}.description`) : "";

  const primaryIsHome = kind !== "unauthorized" && !onRetry;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Empty className="max-w-md border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl [&_svg]:size-6"
          >
            <Icon aria-hidden />
          </EmptyMedia>
          <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {code}
          </p>
          <EmptyTitle className="text-xl font-semibold tracking-tight">
            {title}
          </EmptyTitle>
          <EmptyDescription className="text-base">
            {description}
          </EmptyDescription>
          {digest ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {ready
                ? t("errors.digest", { digest })
                : `Ref: ${digest}`}
            </p>
          ) : null}
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {kind === "unauthorized" ? (
              <Link
                href={env.loginPath}
                className={cn(buttonVariants({ variant: "default" }))}
              >
                <LogInIcon />
                {t("errors.actions.login")}
              </Link>
            ) : null}

            {onRetry ? (
              <Button type="button" onClick={onRetry}>
                <RefreshCwIcon />
                {t("actions.retry")}
              </Button>
            ) : null}

            <Link
              href="/home"
              className={cn(
                buttonVariants({
                  variant: primaryIsHome ? "default" : "outline",
                }),
              )}
            >
              <HomeIcon />
              {t("errors.actions.home")}
            </Link>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import {
  CheckCircle2Icon,
  ConstructionIcon,
  InboxIcon,
  Loader2Icon,
  RefreshCwIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type {
  PageEmptyProps,
  PageErrorInlineProps,
  PageLoadingProps,
  PageStateProps,
  PageSuccessProps,
  PageStateVariant,
} from "../model/types";

const ICONS: Record<PageStateVariant, typeof InboxIcon> = {
  loading: Loader2Icon,
  empty: InboxIcon,
  error: TriangleAlertIcon,
  success: CheckCircle2Icon,
  comingSoon: ConstructionIcon,
  maintenance: WrenchIcon,
};

/**
 * Shared in-page states — Loading / Empty / Error / Success / Coming soon.
 * Night Amber Social, mobile-first. Use for feature screens (not HTTP error pages).
 */
export function PageState({
  variant,
  title,
  description,
  action,
  children,
  className,
  compact,
}: PageStateProps) {
  const { t, ready } = useAppTranslation("common");
  const Icon = ICONS[variant];
  const prefix = `states.${variant}`;

  const resolvedTitle = title ?? (ready ? t(`${prefix}.title`) : "…");
  const resolvedDescription =
    description ?? (ready ? t(`${prefix}.description`) : "");

  if (variant === "loading") {
    return (
      <PageLoading
        title={resolvedTitle}
        description={resolvedDescription}
        className={className}
        compact={compact}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center px-4",
        compact ? "py-8" : "py-12",
        className,
      )}
    >
      <Empty className="max-w-md border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className={cn(
              "size-12 rounded-xl [&_svg]:size-6",
              variant === "error" && "bg-destructive/15 text-destructive",
              variant === "success" && "bg-success/15 text-success",
              variant === "comingSoon" && "bg-primary/15 text-primary",
              variant === "maintenance" && "bg-warning/15 text-warning",
            )}
          >
            <Icon aria-hidden />
          </EmptyMedia>
          {variant === "comingSoon" && ready ? (
            <p className="font-mono text-[10px] font-medium tracking-widest text-primary uppercase">
              {t("states.comingSoon.badge")}
            </p>
          ) : null}
          <EmptyTitle className="text-lg font-semibold tracking-tight">
            {resolvedTitle}
          </EmptyTitle>
          {resolvedDescription ? (
            <EmptyDescription className="text-sm">
              {resolvedDescription}
            </EmptyDescription>
          ) : null}
        </EmptyHeader>
        {(action || children) && (
          <EmptyContent>
            {action}
            {children}
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}

export function PageLoading({
  title,
  description,
  className,
  compact,
}: PageLoadingProps) {
  const { t, ready } = useAppTranslation("common");

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-4",
        compact ? "py-8" : "py-16",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Loader2Icon className="size-6 animate-spin" aria-hidden />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">
          {title ?? (ready ? t("states.loading.title") : t("actions.loading"))}
        </p>
        {(description || ready) && (
          <p className="max-w-xs text-sm text-muted-foreground">
            {description ?? t("states.loading.description")}
          </p>
        )}
      </div>
      <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-4/5 self-center rounded-full" />
        <Skeleton className="h-3 w-3/5 self-center rounded-full" />
      </div>
    </div>
  );
}

export function PageEmpty({
  title,
  description,
  action,
  className,
  compact,
  children,
}: PageEmptyProps) {
  return (
    <PageState
      variant="empty"
      title={title}
      description={description}
      action={action}
      className={className}
      compact={compact}
    >
      {children}
    </PageState>
  );
}

export function PageErrorInline({
  title,
  description,
  onRetry,
  className,
  compact,
}: PageErrorInlineProps) {
  const { t, ready } = useAppTranslation("common");

  return (
    <PageState
      variant="error"
      title={title}
      description={description}
      className={className}
      compact={compact}
      action={
        onRetry ? (
          <Button type="button" variant="default" onClick={onRetry}>
            <RefreshCwIcon />
            {ready ? t("actions.retry") : "Retry"}
          </Button>
        ) : undefined
      }
    />
  );
}

export function PageSuccess({
  title,
  description,
  action,
  className,
  compact,
}: PageSuccessProps) {
  return (
    <PageState
      variant="success"
      title={title}
      description={description}
      action={action}
      className={className}
      compact={compact}
    />
  );
}

/** Scaffold shell for routes not yet fully implemented */
export function ComingSoonState({
  title,
  description,
  action,
  className,
}: Omit<PageStateProps, "variant">) {
  return (
    <PageState
      variant="comingSoon"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

interface RoutePlaceholderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Sprint scaffold body for unfinished product screens */
export function RoutePlaceholder({
  title,
  description,
  action,
}: RoutePlaceholderProps) {
  return (
    <ComingSoonState
      title={title}
      description={description}
      action={action}
    />
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { userApi, userKeys } from "@/entities/user";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { usePeerReviews } from "../hook/use-peer-reviews";
import { ReviewList } from "./review-list";
import { WriteReviewForm } from "./write-review-form";

interface ReviewsScreenProps {
  /** Target user. Defaults to current user (me). */
  userId?: string;
  /** Show write form for others */
  mode?: "list" | "write";
}

export function ReviewsScreen({
  userId,
  mode = "list",
}: ReviewsScreenProps) {
  const { t, ready } = useAppTranslation(["user", "common"]);
  const me = useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userApi.getMe(),
  });
  const targetId = userId ?? me.data?.id;
  const isOwn = !userId || userId === me.data?.id;

  const reviews = usePeerReviews(targetId, Boolean(targetId));

  if (!ready || me.isLoading || reviews.isLoading) return <PageLoading />;
  if (me.isError || reviews.isError || !targetId) {
    return (
      <PageErrorInline
        onRetry={() => {
          void me.refetch();
          void reviews.refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isOwn ? t("reviews.title") : t("reviews.titleOther")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isOwn ? t("reviews.subtitle") : t("reviews.subtitleOther")}
        </p>
      </header>

      {mode === "write" && !isOwn ? (
        <WriteReviewForm revieweeId={targetId} />
      ) : (
        <>
          <ReviewList reviews={reviews.data ?? []} />
          {!isOwn ? (
            <Link
              href={`${routes.userReviews(targetId)}?mode=write`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "min-h-11 rounded-xl",
              )}
            >
              {t("reviews.write")}
            </Link>
          ) : null}
        </>
      )}

      <Link
        href={isOwn ? routes.profile : routes.userPublic(targetId)}
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

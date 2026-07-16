"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  PageErrorInline,
  PageLoading,
} from "@/widgets/page-state";
import { useUserProfile } from "../hook/use-user-profile";
import { DrunkProfileCard } from "./drunk-profile-card";

interface PublicProfileScreenProps {
  userId: string;
}

export function PublicProfileScreen({ userId }: PublicProfileScreenProps) {
  const { t, ready } = useAppTranslation(["user", "common"]);
  const { data: user, isLoading, isError, refetch } = useUserProfile(userId);

  if (!ready || isLoading) return <PageLoading />;
  if (isError || !user) {
    return (
      <PageErrorInline
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="page-shell gap-6 md:gap-7">
      <header className="space-y-1 md:space-y-1.5">
        <p className="text-xs font-medium tracking-wide text-primary uppercase md:text-[0.8125rem]">
          {t("profile.public")}
        </p>
        <h1 className="page-title">{user.name}</h1>
      </header>

      <DrunkProfileCard user={user} isOwner={false} />

      <div className="grid gap-2 md:gap-3">
        <Link
          href={`${routes.userReviews(userId)}?mode=write`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-11 rounded-xl md:min-h-12",
          )}
        >
          {t("reviews.write")}
        </Link>
        <Link
          href={routes.profile}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl md:min-h-12",
          )}
        >
          {t("common:actions.back")}
        </Link>
      </div>
    </div>
  );
}

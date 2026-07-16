"use client";

import Link from "next/link";
import type { User } from "@/entities/user";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { LevelBadge } from "./level-badge";
import { ProfileStats } from "./profile-stats";

interface DrunkProfileCardProps {
  user: User;
  /** Owner sees edit shortcuts */
  isOwner?: boolean;
  className?: string;
}

export function DrunkProfileCard({
  user,
  isOwner,
  className,
}: DrunkProfileCardProps) {
  const { t } = useAppTranslation("user");
  const dp = user.drunkProfile;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-amber-glow ring-1 ring-primary/10">
        <div className="flex items-start gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
            {(user.name || "?").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="truncate text-xl font-bold tracking-tight">
              {user.name}
            </h1>
            {user.email && isOwner ? (
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            ) : null}
            {user.bio ? (
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            ) : null}
            <div className="pt-1">
              <LevelBadge level={user.alcoholToleranceLevel} showHint />
            </div>
          </div>
        </div>

        {(dp?.occupation || dp?.education || dp?.selfIntroduction) && (
          <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
            {dp.occupation ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">
                  {t("fields.occupation")}
                </dt>
                <dd className="font-medium text-right">{dp.occupation}</dd>
              </div>
            ) : null}
            {dp.education ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">
                  {t("fields.education")}
                </dt>
                <dd className="font-medium text-right">{dp.education}</dd>
              </div>
            ) : null}
            {dp.selfIntroduction ? (
              <div>
                <dt className="text-muted-foreground">
                  {t("fields.selfIntroduction")}
                </dt>
                <dd className="mt-1 text-foreground">
                  {dp.selfIntroduction}
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </section>

      <ProfileStats user={user} />

      {isOwner ? (
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={routes.profileEdit}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 rounded-xl",
            )}
          >
            {t("profile.edit")}
          </Link>
          <Link
            href={routes.profileReviews}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "min-h-11 rounded-xl",
            )}
          >
            {t("profile.reviews")}
          </Link>
        </div>
      ) : (
        <Link
          href={routes.userReviews(user.id)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 rounded-xl",
          )}
        >
          {t("reviews.viewAll")}
        </Link>
      )}
    </div>
  );
}

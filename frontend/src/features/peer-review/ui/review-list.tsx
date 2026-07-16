"use client";

import { StarIcon } from "lucide-react";
import type { PeerReview } from "@/entities/peer-review";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { PageEmpty } from "@/widgets/page-state";

interface ReviewListProps {
  reviews: PeerReview[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={
            i < rating
              ? "size-3.5 fill-primary text-primary"
              : "size-3.5 text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews }: ReviewListProps) {
  const { t } = useAppTranslation("user");

  if (reviews.length === 0) {
    return (
      <PageEmpty
        title={t("reviews.empty")}
        description={t("reviews.emptyHint")}
        compact
      />
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {review.reviewerName || review.reviewerId.slice(0, 8)}
              </p>
              <Stars rating={review.rating} />
            </div>
            <time className="text-[11px] text-muted-foreground">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : ""}
            </time>
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {review.comment}
            </p>
          ) : null}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Session · {review.sessionId}
          </p>
        </li>
      ))}
    </ul>
  );
}

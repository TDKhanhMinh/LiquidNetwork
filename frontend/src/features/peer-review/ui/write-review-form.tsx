"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, StarIcon } from "lucide-react";
import { routes } from "@/shared/config";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { PageSuccess } from "@/widgets/page-state";
import { useCreatePeerReview } from "../hook/use-peer-reviews";

interface WriteReviewFormProps {
  revieweeId: string;
  revieweeName?: string;
}

export function WriteReviewForm({
  revieweeId,
  revieweeName,
}: WriteReviewFormProps) {
  const router = useRouter();
  const { t, ready } = useAppTranslation(["user", "common"]);
  const create = useCreatePeerReview(revieweeId);
  const [rating, setRating] = useState(5);
  const [sessionId, setSessionId] = useState("sess_manual");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (rating < 1 || rating > 5) {
      setLocalError(t("reviews.validation.rating"));
      return;
    }
    if (!sessionId.trim()) {
      setLocalError(t("reviews.validation.session"));
      return;
    }
    try {
      await create.mutateAsync({
        sessionId: sessionId.trim(),
        rating,
        comment: comment.trim() || undefined,
      });
      setDone(true);
    } catch {
      // toast
    }
  }

  if (!ready) return null;

  if (done) {
    return (
      <PageSuccess
        title={t("reviews.successTitle")}
        description={t("reviews.successBody")}
        action={
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => router.replace(routes.userPublic(revieweeId))}
          >
            {t("profile.public")}
          </Button>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {t("reviews.writeTitle", { name: revieweeName || "…" })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("reviews.writeSubtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("reviews.rating")}</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
                aria-label={`${value}`}
              >
                <StarIcon
                  className={cn(
                    "size-7",
                    value <= rating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="session-id">{t("reviews.sessionId")}</Label>
        <Input
          id="session-id"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="h-12 min-h-11 rounded-xl border-border bg-muted/40 text-base"
        />
        <p className="text-xs text-muted-foreground">
          {t("reviews.sessionHint")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-comment">{t("reviews.comment")}</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("reviews.commentPlaceholder")}
          className="min-h-28 rounded-xl border-border bg-muted/40 text-base"
        />
      </div>

      {localError ? (
        <p role="alert" className="text-sm text-destructive">
          {localError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={create.isPending}
        className="min-h-12 rounded-xl text-base font-semibold"
      >
        {create.isPending ? (
          <>
            <Loader2Icon className="animate-spin" />
            {t("reviews.submitting")}
          </>
        ) : (
          t("reviews.submit")
        )}
      </Button>
    </form>
  );
}

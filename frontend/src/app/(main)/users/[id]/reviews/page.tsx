"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ReviewsScreen } from "@/features/peer-review";
import { PageLoading } from "@/widgets/page-state";

function UserReviewsContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "write" ? "write" : "list";
  return <ReviewsScreen userId={userId} mode={mode} />;
}

export default function UserReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<PageLoading />}>
      <UserReviewsContent userId={id} />
    </Suspense>
  );
}

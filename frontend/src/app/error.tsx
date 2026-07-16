"use client";

import { useEffect } from "react";
import { ErrorState } from "@/widgets/error-state";

/**
 * Segment error boundary (runtime / render errors under root layout).
 * Next.js 16: prefer `unstable_retry` to re-fetch + re-render the segment.
 */
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Hook for monitoring (Sentry, etc.) later
    console.error("[app/error]", error);
  }, [error]);

  return (
    <ErrorState
      kind="server"
      digest={error.digest}
      onRetry={() => unstable_retry()}
    />
  );
}

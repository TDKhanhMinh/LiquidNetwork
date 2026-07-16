"use client";

import { useEffect } from "react";
import { ErrorState } from "@/widgets/error-state";
import { Providers } from "./providers";
import "./globals.css";

/**
 * Root layout error boundary — must define its own html/body
 * (root layout is unmounted when this renders).
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <ErrorState
            kind="generic"
            digest={error.digest}
            onRetry={() => unstable_retry()}
          />
        </Providers>
      </body>
    </html>
  );
}

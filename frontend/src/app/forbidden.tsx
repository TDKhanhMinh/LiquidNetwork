import type { Metadata } from "next";
import { ErrorState } from "@/widgets/error-state";

export const metadata: Metadata = {
  title: "403 · LiquidNetwork",
};

/**
 * Permission denied (403).
 * Trigger with `import { forbidden } from "next/navigation"; forbidden();`
 * Requires `experimental.authInterrupts: true` in next.config.
 */
export default function ForbiddenPage() {
  return <ErrorState kind="forbidden" />;
}

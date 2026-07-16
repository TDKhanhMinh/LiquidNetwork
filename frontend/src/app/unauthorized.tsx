import type { Metadata } from "next";
import { ErrorState } from "@/widgets/error-state";

export const metadata: Metadata = {
  title: "401 · LiquidNetwork",
};

/**
 * Unauthenticated (401).
 * Trigger with `import { unauthorized } from "next/navigation"; unauthorized();`
 * Requires `experimental.authInterrupts: true` in next.config.
 */
export default function UnauthorizedPage() {
  return <ErrorState kind="unauthorized" />;
}

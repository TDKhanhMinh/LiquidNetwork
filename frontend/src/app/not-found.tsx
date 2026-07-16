import type { Metadata } from "next";
import { ErrorState } from "@/widgets/error-state";

export const metadata: Metadata = {
  title: "404 · LiquidNetwork",
};

/**
 * Rendered when `notFound()` is called or no matching route is found
 * under the root layout.
 */
export default function NotFoundPage() {
  return <ErrorState kind="not-found" />;
}

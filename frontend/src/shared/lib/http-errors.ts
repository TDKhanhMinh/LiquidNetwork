/**
 * Re-export Next.js auth/navigation interrupt helpers for app/feature code.
 *
 * @example
 * import { notFound, forbidden, unauthorized } from "@/shared/lib/http-errors";
 *
 * if (!resource) notFound();
 * if (!session) unauthorized();
 * if (session.role !== "admin") forbidden();
 */
export { notFound, forbidden, unauthorized } from "next/navigation";

export type ErrorPageKind =
  | "not-found"
  | "forbidden"
  | "unauthorized"
  | "server"
  | "generic";

export interface ErrorStateProps {
  kind: ErrorPageKind;
  /** Optional digest from Next.js error boundary (for support / logs) */
  digest?: string;
  /** Retry handler for runtime errors */
  onRetry?: () => void;
}

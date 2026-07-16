import type { ReactNode } from "react";

export type PageStateVariant =
  | "loading"
  | "empty"
  | "error"
  | "success"
  | "comingSoon"
  | "maintenance";

export interface PageStateProps {
  variant: PageStateVariant;
  /** Override default i18n title */
  title?: string;
  /** Override default i18n description */
  description?: string;
  /** Optional primary action (button / link) */
  action?: ReactNode;
  /** Extra content below description */
  children?: ReactNode;
  className?: string;
  /** Compact layout for inline panels */
  compact?: boolean;
}

export interface PageLoadingProps {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export interface PageEmptyProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
  children?: ReactNode;
}

export interface PageErrorInlineProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export interface PageSuccessProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

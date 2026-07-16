export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export type ReportCategory =
  | "abuse"
  | "spam"
  | "safety"
  | "payment"
  | "bug"
  | "other";

export interface SupportReport {
  id: string;
  category: ReportCategory;
  subject: string;
  description: string;
  createdAt: string;
  status: "received" | "reviewing" | "resolved";
}

export interface CreateReportInput {
  category: ReportCategory;
  subject: string;
  description: string;
}

import type { CreateReportInput, SupportReport } from "../model/types";

const KEY = "ln.support_reports";

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const supportMockStore = {
  listReports(): SupportReport[] {
    return readJson<SupportReport[]>(KEY, []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  createReport(input: CreateReportInput): SupportReport {
    const report: SupportReport = {
      id: `rep_${Math.random().toString(36).slice(2, 10)}`,
      category: input.category,
      subject: input.subject.trim(),
      description: input.description.trim(),
      createdAt: new Date().toISOString(),
      status: "received",
    };
    const list = this.listReports();
    list.unshift(report);
    writeJson(KEY, list);
    return report;
  },
};

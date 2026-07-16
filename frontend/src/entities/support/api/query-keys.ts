export const supportKeys = {
  all: ["support"] as const,
  faq: () => [...supportKeys.all, "faq"] as const,
  reports: () => [...supportKeys.all, "reports"] as const,
};

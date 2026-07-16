export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  reviews: (id: string) => [...userKeys.all, "reviews", id] as const,
};

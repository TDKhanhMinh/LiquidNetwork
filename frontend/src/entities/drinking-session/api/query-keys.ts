export const drinkingSessionKeys = {
  all: ["drinking-sessions"] as const,
  list: () => [...drinkingSessionKeys.all, "list"] as const,
  detail: (id: string) => [...drinkingSessionKeys.all, "detail", id] as const,
};

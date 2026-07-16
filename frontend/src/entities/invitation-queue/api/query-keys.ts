export const invitationQueueKeys = {
  all: ["invitation-queue"] as const,
  me: () => [...invitationQueueKeys.all, "me"] as const,
  detail: (id: string) => [...invitationQueueKeys.all, "detail", id] as const,
  history: () => [...invitationQueueKeys.all, "history"] as const,
  invitation: (id: string) =>
    [...invitationQueueKeys.all, "invitation", id] as const,
  candidates: (q: string) =>
    [...invitationQueueKeys.all, "candidates", q] as const,
  suggestions: () => [...invitationQueueKeys.all, "suggestions"] as const,
};

export const invitationQueueKeys = {
  all: ["invitation-queue"] as const,
  me: () => [...invitationQueueKeys.all, "me"] as const,
};

export const friendsKeys = {
  all: ["friends"] as const,
  list: (filter = "all") => [...friendsKeys.all, "list", filter] as const,
};

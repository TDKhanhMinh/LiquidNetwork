export { AuthGate } from "./ui/auth-gate";
export type { AuthGateMode } from "./ui/auth-gate";
export { useAuthStatus } from "./hook/use-auth-status";
export type { AuthStatus } from "./hook/use-auth-status";
/** Re-export for convenience — source of truth is shared/lib */
export { notifyAuthChanged } from "@/shared/lib/auth-events";

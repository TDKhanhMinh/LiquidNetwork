/**
 * Drinking session entity — expand as backend domain stabilizes.
 */
export interface DrinkingSession {
  id: string;
  hostId: string;
  title?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

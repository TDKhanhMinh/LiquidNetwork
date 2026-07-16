/**
 * User entity types — aligned with backend `IUser`.
 * Field names use frontend-friendly forms where API may map `_id` → `id`.
 */
export type AlcoholToleranceLevel =
  | "low"
  | "medium"
  | "high"
  | "very_high"
  | string;

export interface DrunkProfile {
  occupation?: string;
  education?: string;
  selfIntroduction?: string;
}

export interface PrivacySettings {
  hideProfile: boolean;
  hideLevel: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  drunkProfile?: DrunkProfile;
  alcoholToleranceLevel?: AlcoholToleranceLevel;
  privacySettings?: PrivacySettings;
  isEmailVerified?: boolean;
  sessionsJoined?: number;
  invitationAcceptRate?: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

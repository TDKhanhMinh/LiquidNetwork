/**
 * User entity types — aligned with backend `IUser` / AlcoholToleranceLevel enum.
 */
export type AlcoholToleranceLevel =
  | "LEVEL_1"
  | "LEVEL_2"
  | "LEVEL_3"
  | "LEVEL_4";

export const ALCOHOL_TOLERANCE_LEVELS: AlcoholToleranceLevel[] = [
  "LEVEL_1",
  "LEVEL_2",
  "LEVEL_3",
  "LEVEL_4",
];

export type Gender = "male" | "female" | "other" | "prefer_not";

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
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  drunkProfile?: DrunkProfile;
  alcoholToleranceLevel?: AlcoholToleranceLevel | string;
  privacySettings?: PrivacySettings;
  isEmailVerified?: boolean;
  sessionsJoined?: number;
  invitationAcceptRate?: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateDrunkProfilePayload {
  drunkProfile: DrunkProfile;
}

export interface UpdateToleranceLevelPayload {
  level: AlcoholToleranceLevel;
}

/** First-time profile setup (maps onto users/me + tolerance endpoints) */
export interface SetupProfilePayload {
  name: string;
  gender: Gender;
  birthYear: number;
  alcoholToleranceLevel: AlcoholToleranceLevel;
  phone?: string;
}

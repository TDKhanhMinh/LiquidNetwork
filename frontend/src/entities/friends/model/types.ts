export type FriendRelation = "friend" | "drinking_buddy" | "both";

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  occupation?: string;
  alcoholToleranceLevel?: string;
  relation: FriendRelation;
  sessionsTogether: number;
  lastSessionAt?: string | null;
  bio?: string;
}

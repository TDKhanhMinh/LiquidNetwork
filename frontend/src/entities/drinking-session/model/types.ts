export type SessionStatus =
  | "scheduled"
  | "live"
  | "ended"
  | "cancelled";

export type ParticipantCheckInStatus =
  | "invited"
  | "accepted"
  | "checked_in"
  | "no_show"
  | "left";

export interface SessionParticipant {
  userId: string;
  name: string;
  status: ParticipantCheckInStatus;
  checkedInAt?: string | null;
}

export interface DrinkingSession {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  location: string;
  note?: string;
  maxParticipants: number;
  status: SessionStatus;
  startTime: string;
  startedAt?: string | null;
  endedAt?: string | null;
  participants: SessionParticipant[];
  mode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDrinkingSessionInput {
  title: string;
  location: string;
  maxParticipants: number;
  startTime: string;
  note?: string;
  inviteeIds?: string[];
}

export interface InviteToSessionInput {
  userIds: string[];
}

export interface EndSessionInput {
  rating?: number;
  comment?: string;
}

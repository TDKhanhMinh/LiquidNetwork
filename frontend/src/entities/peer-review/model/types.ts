export interface PeerReview {
  id: string;
  reviewerId: string;
  reviewerName?: string;
  revieweeId: string;
  sessionId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface CreatePeerReviewPayload {
  sessionId: string;
  rating: number;
  comment?: string;
}

export interface LevelHistoryEntry {
  id: string;
  level: string;
  source: "self" | "system" | "review";
  note?: string;
  createdAt: string;
}

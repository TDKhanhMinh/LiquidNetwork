export interface CreatePeerReviewCommand {
  revieweeId: string;
  sessionId: string;
  rating: number;
  comment?: string;
}

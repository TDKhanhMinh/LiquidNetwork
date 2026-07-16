import { IPeerReview } from '../../domain/interfaces/peer-review.interface';

export class PeerReviewResponseDto {
  id: string;
  reviewerId: string;
  revieweeId: string;
  sessionId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;

  constructor(review: IPeerReview) {
    this.id = (review as any).id || (review as any)._id?.toString();
    this.reviewerId = review.reviewerId;
    this.revieweeId = review.revieweeId;
    this.sessionId = review.sessionId;
    this.rating = review.rating;
    this.comment = review.comment;
    this.createdAt = review.createdAt;
  }
}

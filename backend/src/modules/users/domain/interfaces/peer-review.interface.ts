export interface IPeerReview {
  _id?: any;
  reviewerId: string;
  revieweeId: string;
  sessionId: string;
  rating: number; // e.g., 1 to 5
  comment?: string;
  
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

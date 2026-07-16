import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IPeerReview } from '../../../domain/interfaces/peer-review.interface';

export type PeerReviewDocument = PeerReview & Document;

@Schema({ timestamps: true, collection: 'peer_reviews' })
export class PeerReview implements IPeerReview {
  @Prop({ type: String, required: true })
  reviewerId: string;

  @Prop({ type: String, required: true })
  revieweeId: string;

  @Prop({ type: String, required: true })
  sessionId: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String })
  comment?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const PeerReviewSchema = SchemaFactory.createForClass(PeerReview);

// Ensure a user can only review another user once per session
PeerReviewSchema.index({ reviewerId: 1, revieweeId: 1, sessionId: 1 }, { unique: true });

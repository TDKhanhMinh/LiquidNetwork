import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AlcoholToleranceLevel } from '../../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../../domain/enums/matching-mode.enum';
import {
  IMatchingHistory,
  IMatchingHistoryFiltersSnapshot,
  IMatchingHistoryScoreEntry,
} from '../../../domain/entities/matching-history.entity';

@Schema({ _id: false })
export class MatchingHistoryScoreEntry implements IMatchingHistoryScoreEntry {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({
    type: {
      level: Number,
      mode: Number,
      reputation: Number,
      activity: Number,
      occupation: Number,
    },
    required: true,
  })
  breakdown: {
    level: number;
    mode: number;
    reputation: number;
    activity: number;
    occupation: number;
  };
}

const MatchingHistoryScoreEntrySchema = SchemaFactory.createForClass(
  MatchingHistoryScoreEntry,
);

@Schema({ _id: false })
export class MatchingHistoryFiltersSnapshot
  implements IMatchingHistoryFiltersSnapshot
{
  @Prop({ type: String, enum: Object.values(MatchingMode) })
  mode?: MatchingMode;

  @Prop({
    type: [String],
    enum: Object.values(AlcoholToleranceLevel),
    default: undefined,
  })
  preferredAlcoholLevels?: AlcoholToleranceLevel[];

  @Prop({ type: [String], default: undefined })
  preferredOccupations?: string[];

  @Prop({ type: [String], default: undefined })
  excludeUserIds?: string[];

  @Prop({ type: Number })
  limit?: number;
}

const MatchingHistoryFiltersSnapshotSchema = SchemaFactory.createForClass(
  MatchingHistoryFiltersSnapshot,
);

export type MatchingHistoryDocument = MatchingHistory & Document;

@Schema({ timestamps: true, collection: 'matching_histories' })
export class MatchingHistory implements IMatchingHistory {
  @Prop({ type: String, required: true, index: true })
  requesterId: string;

  @Prop({
    type: String,
    enum: Object.values(MatchingMode),
    required: true,
  })
  mode: MatchingMode;

  @Prop({ type: MatchingHistoryFiltersSnapshotSchema, default: {} })
  filters: MatchingHistoryFiltersSnapshot;

  @Prop({ type: [String], default: [] })
  candidateIds: string[];

  @Prop({ type: [MatchingHistoryScoreEntrySchema], default: [] })
  scores: MatchingHistoryScoreEntry[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const MatchingHistorySchema =
  SchemaFactory.createForClass(MatchingHistory);

MatchingHistorySchema.index({ requesterId: 1, createdAt: -1 });

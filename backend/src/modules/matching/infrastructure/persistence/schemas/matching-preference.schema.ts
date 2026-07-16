import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AlcoholToleranceLevel } from '../../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../../domain/enums/matching-mode.enum';
import { IMatchingPreference } from '../../../domain/entities/matching-preference.entity';
import {
  ABSOLUTE_MAX_CANDIDATES,
  DEFAULT_EXCLUDE_RECENT_DAYS,
  DEFAULT_MAX_CANDIDATES,
  DEFAULT_MAX_DISTANCE_KM,
} from '../../../domain/constants/scoring.constants';

export type MatchingPreferenceDocument = MatchingPreference & Document;

@Schema({ timestamps: true, collection: 'matching_preferences' })
export class MatchingPreference implements IMatchingPreference {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({
    type: [String],
    enum: Object.values(MatchingMode),
    default: [MatchingMode.CASUAL],
  })
  preferredModes: MatchingMode[];

  @Prop({
    type: [String],
    enum: Object.values(AlcoholToleranceLevel),
    default: [],
  })
  preferredAlcoholLevels: AlcoholToleranceLevel[];

  @Prop({ type: [String], default: [] })
  preferredOccupations: string[];

  @Prop({ type: Number, default: DEFAULT_MAX_DISTANCE_KM })
  maxDistanceKm?: number | null;

  @Prop({ type: Number, default: DEFAULT_MAX_CANDIDATES, max: ABSOLUTE_MAX_CANDIDATES })
  maxCandidates: number;

  @Prop({ type: Number, default: DEFAULT_EXCLUDE_RECENT_DAYS })
  excludeRecentDays: number;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const MatchingPreferenceSchema =
  SchemaFactory.createForClass(MatchingPreference);

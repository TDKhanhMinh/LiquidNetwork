import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../enums/matching-mode.enum';

export interface IMatchingPreference {
  _id?: any;
  userId: string;
  preferredModes: MatchingMode[];
  preferredAlcoholLevels: AlcoholToleranceLevel[];
  preferredOccupations: string[];
  /** Stored for Phase 2 geo; not applied in Phase 1 scoring/filter */
  maxDistanceKm?: number | null;
  maxCandidates: number;
  excludeRecentDays: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../enums/matching-mode.enum';
import { ScoreBreakdown } from './candidate-score.entity';

export interface IMatchingHistoryScoreEntry {
  userId: string;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface IMatchingHistoryFiltersSnapshot {
  mode?: MatchingMode;
  preferredAlcoholLevels?: AlcoholToleranceLevel[];
  preferredOccupations?: string[];
  excludeUserIds?: string[];
  limit?: number;
}

export interface IMatchingHistory {
  _id?: any;
  requesterId: string;
  mode: MatchingMode;
  filters: IMatchingHistoryFiltersSnapshot;
  candidateIds: string[];
  scores: IMatchingHistoryScoreEntry[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

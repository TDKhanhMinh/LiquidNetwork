import { Injectable } from '@nestjs/common';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { IUser } from '../../../users/domain/interfaces/user.interface';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { ScoreBreakdown } from '../../domain/entities/candidate-score.entity';
import { breakdownToPercent } from '../../domain/value-objects/compatibility-score.vo';
import { computeCompatibilityScore } from '../../domain/services/score-calculators';

export interface ScorePairInput {
  requester: IUser;
  candidate: IUser;
  mode: MatchingMode;
  preferredOccupations: string[];
  now?: Date;
}

export interface ScoredPairResult {
  score: number;
  breakdown: ScoreBreakdown;
  breakdownPercent: ScoreBreakdown;
}

@Injectable()
export class CompatibilityScoringService {
  scorePair(input: ScorePairInput): ScoredPairResult {
    const { score, breakdown } = computeCompatibilityScore({
      requesterLevel:
        input.requester.alcoholToleranceLevel ?? AlcoholToleranceLevel.LEVEL_1,
      candidateLevel:
        input.candidate.alcoholToleranceLevel ?? AlcoholToleranceLevel.LEVEL_1,
      candidateAverageRating: input.candidate.averageRating ?? 0,
      candidateTotalReviews: input.candidate.totalReviews ?? 0,
      candidateUpdatedAt: input.candidate.updatedAt,
      mode: input.mode,
      preferredOccupations: input.preferredOccupations,
      candidateOccupation: input.candidate.drunkProfile?.occupation,
      now: input.now,
    });

    return {
      score,
      breakdown,
      breakdownPercent: breakdownToPercent(breakdown),
    };
  }
}

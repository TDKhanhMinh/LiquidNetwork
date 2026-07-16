import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../enums/matching-mode.enum';
import {
  ACTIVITY_FULL_SCORE_DAYS,
  ACTIVITY_ZERO_SCORE_DAYS,
  REPUTATION_MIN_REVIEWS_FOR_FULL_WEIGHT,
} from '../constants/scoring.constants';
import { ScoreBreakdown } from '../entities/candidate-score.entity';
import {
  clamp01,
  composeCompatibilityScore,
} from '../value-objects/compatibility-score.vo';

const LEVEL_RANK: Record<AlcoholToleranceLevel, number> = {
  [AlcoholToleranceLevel.LEVEL_1]: 1,
  [AlcoholToleranceLevel.LEVEL_2]: 2,
  [AlcoholToleranceLevel.LEVEL_3]: 3,
  [AlcoholToleranceLevel.LEVEL_4]: 4,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ScoreCandidateInput {
  requesterLevel: AlcoholToleranceLevel;
  candidateLevel: AlcoholToleranceLevel;
  candidateAverageRating: number;
  candidateTotalReviews: number;
  candidateUpdatedAt?: Date | string | null;
  mode: MatchingMode;
  preferredOccupations: string[];
  candidateOccupation?: string | null;
  now?: Date;
}

/**
 * Level similarity: same level = 1, max gap (3 steps) = 0.
 */
export function computeLevelScore(
  requesterLevel: AlcoholToleranceLevel,
  candidateLevel: AlcoholToleranceLevel,
): number {
  const a = LEVEL_RANK[requesterLevel] ?? 1;
  const b = LEVEL_RANK[candidateLevel] ?? 1;
  const gap = Math.abs(a - b);
  return clamp01(1 - Math.min(gap, 3) / 3);
}

/**
 * Reputation 0–1 from averageRating (1–5) with cold-start damping.
 */
export function computeReputationScore(
  averageRating: number,
  totalReviews: number,
): number {
  const rating01 = clamp01((averageRating || 0) / 5);
  if (totalReviews >= REPUTATION_MIN_REVIEWS_FOR_FULL_WEIGHT) {
    return rating01;
  }
  if (totalReviews <= 0) {
    return 0.5;
  }
  const weight = totalReviews / REPUTATION_MIN_REVIEWS_FOR_FULL_WEIGHT;
  return clamp01(rating01 * weight + 0.5 * (1 - weight));
}

/**
 * Activity decay based on updatedAt (proxy for last active).
 */
export function computeActivityScore(
  updatedAt?: Date | string | null,
  now: Date = new Date(),
): number {
  if (!updatedAt) return 0.3;
  const ts = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  if (Number.isNaN(ts.getTime())) return 0.3;

  const days = Math.max(0, (now.getTime() - ts.getTime()) / MS_PER_DAY);
  if (days <= ACTIVITY_FULL_SCORE_DAYS) return 1;
  if (days >= ACTIVITY_ZERO_SCORE_DAYS) return 0;

  const span = ACTIVITY_ZERO_SCORE_DAYS - ACTIVITY_FULL_SCORE_DAYS;
  return clamp01(1 - (days - ACTIVITY_FULL_SCORE_DAYS) / span);
}

/**
 * Phase 1: all visible users score 1.0 for mode.
 * Occupation soft-match is applied separately for NETWORKING.
 */
export function computeModeScore(_mode: MatchingMode): number {
  return 1;
}

/**
 * Occupation soft-match applies only for NETWORKING when preferred occupations are set.
 * Other modes (or empty prefs) return neutral 1.0.
 */
export function computeOccupationScore(
  mode: MatchingMode,
  preferredOccupations: string[],
  candidateOccupation?: string | null,
): number {
  if (mode !== MatchingMode.NETWORKING || !preferredOccupations.length) {
    return 1;
  }

  const occ = (candidateOccupation ?? '').trim().toLowerCase();
  if (!occ) return 0.2;

  const hit = preferredOccupations.some((p) => {
    const term = p.trim().toLowerCase();
    return term.length > 0 && occ.includes(term);
  });
  return hit ? 1 : 0.25;
}

export function computeScoreBreakdown(input: ScoreCandidateInput): ScoreBreakdown {
  return {
    level: computeLevelScore(input.requesterLevel, input.candidateLevel),
    mode: computeModeScore(input.mode),
    reputation: computeReputationScore(
      input.candidateAverageRating,
      input.candidateTotalReviews,
    ),
    activity: computeActivityScore(input.candidateUpdatedAt, input.now),
    occupation: computeOccupationScore(
      input.mode,
      input.preferredOccupations,
      input.candidateOccupation,
    ),
  };
}

export function computeCompatibilityScore(input: ScoreCandidateInput): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const breakdown = computeScoreBreakdown(input);
  return {
    score: composeCompatibilityScore(breakdown),
    breakdown,
  };
}

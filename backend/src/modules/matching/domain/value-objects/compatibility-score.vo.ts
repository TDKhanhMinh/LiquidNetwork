import { ScoreBreakdown } from '../entities/candidate-score.entity';
import { SCORING_WEIGHTS } from '../constants/scoring.constants';

export function clamp01(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function clampScore100(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;
}

/**
 * Weighted score 0–100 from 0–1 component scores.
 */
export function composeCompatibilityScore(breakdown: ScoreBreakdown): number {
  const raw =
    clamp01(breakdown.level) * SCORING_WEIGHTS.level +
    clamp01(breakdown.mode) * SCORING_WEIGHTS.mode +
    clamp01(breakdown.reputation) * SCORING_WEIGHTS.reputation +
    clamp01(breakdown.activity) * SCORING_WEIGHTS.activity +
    clamp01(breakdown.occupation) * SCORING_WEIGHTS.occupation;

  return clampScore100(raw * 100);
}

/** Expose breakdown as 0–100 integers/floats for API readability */
export function breakdownToPercent(breakdown: ScoreBreakdown): ScoreBreakdown {
  return {
    level: clampScore100(clamp01(breakdown.level) * 100),
    mode: clampScore100(clamp01(breakdown.mode) * 100),
    reputation: clampScore100(clamp01(breakdown.reputation) * 100),
    activity: clampScore100(clamp01(breakdown.activity) * 100),
    occupation: clampScore100(clamp01(breakdown.occupation) * 100),
  };
}

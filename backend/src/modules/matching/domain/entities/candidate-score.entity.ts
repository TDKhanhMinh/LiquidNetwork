import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';

/** Per-criterion scores on 0–1 scale before weight (exposed as 0–100 on response). */
export interface ScoreBreakdown {
  level: number;
  mode: number;
  reputation: number;
  activity: number;
  occupation: number;
}

export interface ICandidateScore {
  userId: string;
  name: string;
  avatar?: string;
  alcoholToleranceLevel?: AlcoholToleranceLevel;
  occupation?: string;
  /** Final weighted score 0–100 */
  score: number;
  breakdown: ScoreBreakdown;
}

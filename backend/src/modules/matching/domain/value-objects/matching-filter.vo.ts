import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../enums/matching-mode.enum';
import {
  ABSOLUTE_MAX_CANDIDATES,
  DEFAULT_EXCLUDE_RECENT_DAYS,
  DEFAULT_MAX_CANDIDATES,
} from '../constants/scoring.constants';

export interface MatchingFilterInput {
  mode?: MatchingMode;
  preferredAlcoholLevels?: AlcoholToleranceLevel[];
  preferredOccupations?: string[];
  excludeUserIds?: string[];
  limit?: number;
  excludeRecentDays?: number;
}

export interface ResolvedMatchingFilter {
  mode: MatchingMode;
  preferredAlcoholLevels: AlcoholToleranceLevel[];
  preferredOccupations: string[];
  excludeUserIds: string[];
  limit: number;
  excludeRecentDays: number;
}

export function resolveMatchingFilter(
  input: MatchingFilterInput,
  prefs?: {
    preferredModes?: MatchingMode[];
    preferredAlcoholLevels?: AlcoholToleranceLevel[];
    preferredOccupations?: string[];
    maxCandidates?: number;
    excludeRecentDays?: number;
  } | null,
): ResolvedMatchingFilter {
  const mode =
    input.mode ??
    prefs?.preferredModes?.[0] ??
    MatchingMode.CASUAL;

  const preferredAlcoholLevels =
    input.preferredAlcoholLevels?.length
      ? input.preferredAlcoholLevels
      : (prefs?.preferredAlcoholLevels ?? []);

  const preferredOccupations =
    input.preferredOccupations?.length
      ? input.preferredOccupations.map((o) => o.trim()).filter(Boolean)
      : (prefs?.preferredOccupations ?? []).map((o) => o.trim()).filter(Boolean);

  const excludeUserIds = [
    ...new Set((input.excludeUserIds ?? []).map(String).filter(Boolean)),
  ];

  const rawLimit = input.limit ?? prefs?.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
  const limit = Math.min(
    ABSOLUTE_MAX_CANDIDATES,
    Math.max(1, Math.floor(rawLimit)),
  );

  const excludeRecentDays = Math.max(
    0,
    Math.floor(
      input.excludeRecentDays ??
        prefs?.excludeRecentDays ??
        DEFAULT_EXCLUDE_RECENT_DAYS,
    ),
  );

  return {
    mode,
    preferredAlcoholLevels,
    preferredOccupations,
    excludeUserIds,
    limit,
    excludeRecentDays,
  };
}

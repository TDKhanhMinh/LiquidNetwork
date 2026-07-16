import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';

export interface UpdateMatchingPreferencesCommand {
  userId: string;
  preferredModes?: MatchingMode[];
  preferredAlcoholLevels?: AlcoholToleranceLevel[];
  preferredOccupations?: string[];
  maxDistanceKm?: number | null;
  maxCandidates?: number;
  excludeRecentDays?: number;
}

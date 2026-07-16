import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';

export interface GenerateCandidatesCommand {
  requesterId: string;
  mode?: MatchingMode;
  preferredAlcoholLevels?: AlcoholToleranceLevel[];
  preferredOccupations?: string[];
  excludeUserIds?: string[];
  limit?: number;
  excludeRecentDays?: number;
}

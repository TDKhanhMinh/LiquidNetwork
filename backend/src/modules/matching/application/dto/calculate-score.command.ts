import { MatchingMode } from '../../domain/enums/matching-mode.enum';

export interface CalculateScoreCommand {
  requesterId: string;
  candidateId: string;
  mode?: MatchingMode;
  preferredOccupations?: string[];
}

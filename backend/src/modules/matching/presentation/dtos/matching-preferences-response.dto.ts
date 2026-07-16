import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IMatchingPreference } from '../../domain/entities/matching-preference.entity';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';

export class MatchingPreferencesResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: MatchingMode, isArray: true })
  preferredModes: MatchingMode[];

  @ApiProperty({ enum: AlcoholToleranceLevel, isArray: true })
  preferredAlcoholLevels: AlcoholToleranceLevel[];

  @ApiProperty({ type: [String] })
  preferredOccupations: string[];

  @ApiPropertyOptional({ nullable: true })
  maxDistanceKm?: number | null;

  @ApiProperty()
  maxCandidates: number;

  @ApiProperty()
  excludeRecentDays: number;

  constructor(prefs: IMatchingPreference) {
    this.userId = prefs.userId;
    this.preferredModes = prefs.preferredModes ?? [];
    this.preferredAlcoholLevels = prefs.preferredAlcoholLevels ?? [];
    this.preferredOccupations = prefs.preferredOccupations ?? [];
    this.maxDistanceKm = prefs.maxDistanceKm ?? null;
    this.maxCandidates = prefs.maxCandidates;
    this.excludeRecentDays = prefs.excludeRecentDays;
  }
}

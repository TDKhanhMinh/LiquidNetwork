import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { ABSOLUTE_MAX_CANDIDATES } from '../../domain/constants/scoring.constants';

export class UpdateMatchingPreferencesRequestDto {
  @ApiPropertyOptional({ enum: MatchingMode, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsEnum(MatchingMode, { each: true })
  preferredModes?: MatchingMode[];

  @ApiPropertyOptional({ enum: AlcoholToleranceLevel, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsEnum(AlcoholToleranceLevel, { each: true })
  preferredAlcoholLevels?: AlcoholToleranceLevel[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  preferredOccupations?: string[];

  @ApiPropertyOptional({
    example: 15,
    description: 'Stored for Phase 2 geo; not applied in Phase 1',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsNumber()
  @Min(1)
  @Max(500)
  maxDistanceKm?: number | null;

  @ApiPropertyOptional({ example: 20, maximum: ABSOLUTE_MAX_CANDIDATES })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(ABSOLUTE_MAX_CANDIDATES)
  maxCandidates?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  excludeRecentDays?: number;
}

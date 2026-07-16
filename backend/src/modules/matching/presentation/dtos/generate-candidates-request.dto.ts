import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { ABSOLUTE_MAX_CANDIDATES } from '../../domain/constants/scoring.constants';

export class GenerateCandidatesRequestDto {
  @ApiPropertyOptional({ enum: MatchingMode, example: MatchingMode.CASUAL })
  @IsOptional()
  @IsEnum(MatchingMode)
  mode?: MatchingMode;

  @ApiPropertyOptional({
    enum: AlcoholToleranceLevel,
    isArray: true,
    example: [AlcoholToleranceLevel.LEVEL_2, AlcoholToleranceLevel.LEVEL_3],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsEnum(AlcoholToleranceLevel, { each: true })
  preferredAlcoholLevels?: AlcoholToleranceLevel[];

  @ApiPropertyOptional({
    type: [String],
    example: ['engineer', 'designer'],
    description: 'Soft occupation filters (mainly Networking)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  preferredOccupations?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Extra user ids to exclude from this run',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  excludeUserIds?: string[];

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: ABSOLUTE_MAX_CANDIDATES,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(ABSOLUTE_MAX_CANDIDATES)
  limit?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'Skip candidates returned in matching history within N days',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  excludeRecentDays?: number;
}

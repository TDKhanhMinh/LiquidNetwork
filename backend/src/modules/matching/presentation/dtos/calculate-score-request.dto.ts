import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';

export class CalculateScoreRequestDto {
  @ApiProperty({ example: '64f0a1b2c3d4e5f678901234' })
  @IsMongoId()
  candidateId: string;

  @ApiPropertyOptional({ enum: MatchingMode })
  @IsOptional()
  @IsEnum(MatchingMode)
  mode?: MatchingMode;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  preferredOccupations?: string[];
}

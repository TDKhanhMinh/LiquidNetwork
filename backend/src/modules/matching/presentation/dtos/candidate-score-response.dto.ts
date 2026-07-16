import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICandidateScore,
  ScoreBreakdown,
} from '../../domain/entities/candidate-score.entity';
import { GenerateCandidateListResult } from '../../application/use-cases/generate-candidate-list.use-case';
import { CalculateCompatibilityScoreResult } from '../../application/use-cases/calculate-compatibility-score.use-case';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';

export class ScoreBreakdownDto implements ScoreBreakdown {
  @ApiProperty({ description: '0–100 component' })
  level: number;

  @ApiProperty()
  mode: number;

  @ApiProperty()
  reputation: number;

  @ApiProperty()
  activity: number;

  @ApiProperty()
  occupation: number;

  constructor(b: ScoreBreakdown) {
    this.level = b.level;
    this.mode = b.mode;
    this.reputation = b.reputation;
    this.activity = b.activity;
    this.occupation = b.occupation;
  }
}

export class CandidateScoreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional({ enum: AlcoholToleranceLevel })
  alcoholToleranceLevel?: AlcoholToleranceLevel;

  @ApiPropertyOptional()
  occupation?: string;

  @ApiProperty({ description: 'Weighted compatibility score 0–100' })
  score: number;

  @ApiProperty({ type: ScoreBreakdownDto })
  breakdown: ScoreBreakdownDto;

  constructor(c: ICandidateScore) {
    this.id = c.userId;
    this.name = c.name;
    this.avatar = c.avatar;
    this.alcoholToleranceLevel = c.alcoholToleranceLevel;
    this.occupation = c.occupation;
    this.score = c.score;
    this.breakdown = new ScoreBreakdownDto(c.breakdown);
  }
}

export class GenerateCandidatesResponseDto {
  @ApiProperty()
  mode: string;

  @ApiProperty({ description: 'How many users were scored in the pool' })
  totalScored: number;

  @ApiProperty({ type: [CandidateScoreResponseDto] })
  candidates: CandidateScoreResponseDto[];

  @ApiPropertyOptional({
    description:
      'True when recent matching history excludes were dropped to refill a thin candidate pool',
  })
  historyFallbackApplied?: boolean;

  constructor(result: GenerateCandidateListResult) {
    this.mode = result.mode;
    this.totalScored = result.totalScored;
    this.candidates = result.candidates.map(
      (c) => new CandidateScoreResponseDto(c),
    );
    this.historyFallbackApplied = result.historyFallbackApplied ?? false;
  }
}

export class CalculateScoreResponseDto {
  @ApiProperty()
  requesterId: string;

  @ApiProperty()
  candidateId: string;

  @ApiProperty()
  mode: string;

  @ApiProperty()
  score: number;

  @ApiProperty({ type: ScoreBreakdownDto })
  breakdown: ScoreBreakdownDto;

  @ApiProperty({ type: CandidateScoreResponseDto })
  candidate: CandidateScoreResponseDto;

  constructor(result: CalculateCompatibilityScoreResult) {
    this.requesterId = result.requesterId;
    this.candidateId = result.candidateId;
    this.mode = result.mode;
    this.score = result.score;
    this.breakdown = new ScoreBreakdownDto(result.breakdown);
    this.candidate = new CandidateScoreResponseDto({
      userId: result.candidate.id,
      name: result.candidate.name,
      avatar: result.candidate.avatar,
      alcoholToleranceLevel: result.candidate.alcoholToleranceLevel,
      occupation: result.candidate.occupation,
      score: result.score,
      breakdown: result.breakdown,
    });
  }
}

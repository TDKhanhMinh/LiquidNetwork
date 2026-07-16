import { Body, Controller, Get, Put, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { GenerateCandidateListUseCase } from '../../application/use-cases/generate-candidate-list.use-case';
import { CalculateCompatibilityScoreUseCase } from '../../application/use-cases/calculate-compatibility-score.use-case';
import { GetMatchingPreferencesUseCase } from '../../application/use-cases/get-matching-preferences.use-case';
import { UpdateMatchingPreferencesUseCase } from '../../application/use-cases/update-matching-preferences.use-case';
import {
  GENERATE_CANDIDATES_THROTTLE_LIMIT,
  GENERATE_CANDIDATES_THROTTLE_TTL_MS,
  SCORE_PAIR_THROTTLE_LIMIT,
  SCORE_PAIR_THROTTLE_TTL_MS,
} from '../../domain/constants/scoring.constants';
import { GenerateCandidatesRequestDto } from '../dtos/generate-candidates-request.dto';
import { CalculateScoreRequestDto } from '../dtos/calculate-score-request.dto';
import { UpdateMatchingPreferencesRequestDto } from '../dtos/matching-preferences-request.dto';
import { MatchingPreferencesResponseDto } from '../dtos/matching-preferences-response.dto';
import {
  CalculateScoreResponseDto,
  GenerateCandidatesResponseDto,
} from '../dtos/candidate-score-response.dto';

@ApiTags('Matching')
@ApiBearerAuth('JWT-auth')
@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(
    private readonly generateCandidates: GenerateCandidateListUseCase,
    private readonly calculateScore: CalculateCompatibilityScoreUseCase,
    private readonly getPreferences: GetMatchingPreferencesUseCase,
    private readonly updatePreferences: UpdateMatchingPreferencesUseCase,
  ) {}

  @Post('candidates')
  @Throttle({
    default: {
      limit: GENERATE_CANDIDATES_THROTTLE_LIMIT,
      ttl: GENERATE_CANDIDATES_THROTTLE_TTL_MS,
    },
  })
  @ApiOperation({
    summary: 'Generate ranked candidate list for invitation queue',
    description:
      'Returns scored candidates. Pass ordered ids as inviteeIds to POST /invitation-queue. Distance is not applied in Phase 1 (no user geo yet).',
  })
  @ApiTooManyRequestsResponse({
    description:
      'Rate limit: 30 generates per minute per user (code RATE_LIMIT_EXCEEDED)',
  })
  async candidates(
    @CurrentUser('id') userId: string,
    @Body() body: GenerateCandidatesRequestDto,
  ) {
    const result = await this.generateCandidates.execute({
      requesterId: userId,
      mode: body.mode,
      preferredAlcoholLevels: body.preferredAlcoholLevels,
      preferredOccupations: body.preferredOccupations,
      excludeUserIds: body.excludeUserIds,
      limit: body.limit,
      excludeRecentDays: body.excludeRecentDays,
    });
    return new GenerateCandidatesResponseDto(result);
  }

  @Post('score')
  @Throttle({
    default: {
      limit: SCORE_PAIR_THROTTLE_LIMIT,
      ttl: SCORE_PAIR_THROTTLE_TTL_MS,
    },
  })
  @ApiOperation({
    summary: 'Calculate compatibility score between me and one candidate',
  })
  @ApiTooManyRequestsResponse({
    description:
      'Rate limit: 60 score calls per minute per user (code RATE_LIMIT_EXCEEDED)',
  })
  async score(
    @CurrentUser('id') userId: string,
    @Body() body: CalculateScoreRequestDto,
  ) {
    const result = await this.calculateScore.execute({
      requesterId: userId,
      candidateId: body.candidateId,
      mode: body.mode,
      preferredOccupations: body.preferredOccupations,
    });
    return new CalculateScoreResponseDto(result);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get my matching preferences (defaults if unset)' })
  async getMyPreferences(@CurrentUser('id') userId: string) {
    const prefs = await this.getPreferences.execute(userId);
    return new MatchingPreferencesResponseDto(prefs);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update my matching preferences' })
  async putMyPreferences(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateMatchingPreferencesRequestDto,
  ) {
    const prefs = await this.updatePreferences.execute({
      userId,
      preferredModes: body.preferredModes,
      preferredAlcoholLevels: body.preferredAlcoholLevels,
      preferredOccupations: body.preferredOccupations,
      maxDistanceKm: body.maxDistanceKm,
      maxCandidates: body.maxCandidates,
      excludeRecentDays: body.excludeRecentDays,
    });
    return new MatchingPreferencesResponseDto(prefs);
  }
}

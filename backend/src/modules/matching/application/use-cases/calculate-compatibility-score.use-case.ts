import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { CalculateScoreCommand } from '../dto/calculate-score.command';
import { CompatibilityScoringService } from '../services/compatibility-scoring.service';
import { GetMatchingPreferencesUseCase } from './get-matching-preferences.use-case';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';
import { ScoreBreakdown } from '../../domain/entities/candidate-score.entity';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';

export interface CalculateCompatibilityScoreResult {
  requesterId: string;
  candidateId: string;
  mode: MatchingMode;
  score: number;
  breakdown: ScoreBreakdown;
  candidate: {
    id: string;
    name: string;
    avatar?: string;
    alcoholToleranceLevel?: AlcoholToleranceLevel;
    occupation?: string;
  };
}

@Injectable()
export class CalculateCompatibilityScoreUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly scoringService: CompatibilityScoringService,
    private readonly getPreferences: GetMatchingPreferencesUseCase,
  ) {}

  async execute(
    command: CalculateScoreCommand,
  ): Promise<CalculateCompatibilityScoreResult> {
    if (command.requesterId === command.candidateId) {
      throw new BadRequestException(
        'Cannot score compatibility with yourself',
        'INVALID_CANDIDATE',
      );
    }

    const [requester, candidate, prefs] = await Promise.all([
      this.userRepository.findById(command.requesterId as any),
      this.userRepository.findById(command.candidateId as any),
      this.getPreferences.execute(command.requesterId),
    ]);

    if (!requester || requester.isDeleted) {
      throw new NotFoundException('Requester not found', 'USER_NOT_FOUND');
    }
    if (!candidate || candidate.isDeleted) {
      throw new NotFoundException('Candidate not found', 'USER_NOT_FOUND');
    }
    if (candidate.privacySettings?.hideProfile) {
      throw new NotFoundException('Candidate not found', 'USER_NOT_FOUND');
    }

    const mode =
      command.mode ?? prefs.preferredModes?.[0] ?? MatchingMode.CASUAL;
    const preferredOccupations =
      command.preferredOccupations?.length
        ? command.preferredOccupations
        : prefs.preferredOccupations ?? [];

    const { score, breakdownPercent } = this.scoringService.scorePair({
      requester,
      candidate,
      mode,
      preferredOccupations,
    });

    return {
      requesterId: command.requesterId,
      candidateId: String((candidate as any)._id),
      mode,
      score,
      breakdown: breakdownPercent,
      candidate: {
        id: String((candidate as any)._id),
        name: candidate.name,
        avatar: candidate.avatar,
        alcoholToleranceLevel: candidate.privacySettings?.hideLevel
          ? undefined
          : candidate.alcoholToleranceLevel,
        occupation: candidate.drunkProfile?.occupation,
      },
    };
  }
}

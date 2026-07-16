import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IMatchingHistoryRepository } from '../../domain/repositories/matching-history.repository.interface';
import { GenerateCandidatesCommand } from '../dto/generate-candidates.command';
import { GetMatchingPreferencesUseCase } from './get-matching-preferences.use-case';
import { RecordMatchingHistoryUseCase } from './record-matching-history.use-case';
import { CompatibilityScoringService } from '../services/compatibility-scoring.service';
import { resolveMatchingFilter } from '../../domain/value-objects/matching-filter.vo';
import { ICandidateScore } from '../../domain/entities/candidate-score.entity';
import {
  MATCHING_POOL_LIMIT,
  POOL_HISTORY_FALLBACK_RATIO,
} from '../../domain/constants/scoring.constants';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { IUser } from '../../../users/domain/interfaces/user.interface';

export interface GenerateCandidateListResult {
  mode: string;
  totalScored: number;
  candidates: ICandidateScore[];
  /** true when history excludes were dropped to refill a thin pool */
  historyFallbackApplied?: boolean;
}

@Injectable()
export class GenerateCandidateListUseCase {
  private readonly logger = new Logger(GenerateCandidateListUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMatchingHistoryRepository')
    private readonly historyRepository: IMatchingHistoryRepository,
    private readonly getPreferences: GetMatchingPreferencesUseCase,
    private readonly recordHistory: RecordMatchingHistoryUseCase,
    private readonly scoringService: CompatibilityScoringService,
  ) {}

  async execute(
    command: GenerateCandidatesCommand,
  ): Promise<GenerateCandidateListResult> {
    const requester = await this.userRepository.findById(
      command.requesterId as any,
    );
    if (!requester || requester.isDeleted) {
      throw new NotFoundException('Requester not found', 'USER_NOT_FOUND');
    }

    const prefs = await this.getPreferences.execute(command.requesterId);
    const filter = resolveMatchingFilter(command, prefs);

    const excludeFromHistory =
      filter.excludeRecentDays > 0
        ? await this.historyRepository.findRecentCandidateIds(
            command.requesterId,
            new Date(
              Date.now() - filter.excludeRecentDays * 24 * 60 * 60 * 1000,
            ),
          )
        : [];

    let historyFallbackApplied = false;
    let pool = await this.loadPool(
      command.requesterId,
      filter.preferredAlcoholLevels,
      [...new Set([...filter.excludeUserIds, ...excludeFromHistory])],
    );

    const minPoolSize = Math.max(
      1,
      Math.ceil(filter.limit * POOL_HISTORY_FALLBACK_RATIO),
    );

    if (
      pool.length < minPoolSize &&
      excludeFromHistory.length > 0
    ) {
      this.logger.warn(
        `Matching pool thin after history exclude requester=${command.requesterId} pool=${pool.length} min=${minPoolSize}; retrying without history excludes`,
      );
      pool = await this.loadPool(
        command.requesterId,
        filter.preferredAlcoholLevels,
        filter.excludeUserIds,
      );
      historyFallbackApplied = true;
    }

    const now = new Date();
    const scored: ICandidateScore[] = pool.map((candidate) => {
      const { score, breakdownPercent } = this.scoringService.scorePair({
        requester,
        candidate,
        mode: filter.mode,
        preferredOccupations: filter.preferredOccupations,
        now,
      });

      return {
        userId: String((candidate as any)._id),
        name: candidate.name,
        avatar: candidate.avatar,
        alcoholToleranceLevel: candidate.privacySettings?.hideLevel
          ? undefined
          : (candidate.alcoholToleranceLevel as AlcoholToleranceLevel),
        occupation: candidate.drunkProfile?.occupation,
        score,
        breakdown: breakdownPercent,
      };
    });

    scored.sort((a, b) => b.score - a.score || a.userId.localeCompare(b.userId));
    const top = scored.slice(0, filter.limit);

    await this.recordHistory.execute({
      requesterId: command.requesterId,
      mode: filter.mode,
      filters: {
        mode: filter.mode,
        preferredAlcoholLevels: filter.preferredAlcoholLevels,
        preferredOccupations: filter.preferredOccupations,
        excludeUserIds: filter.excludeUserIds,
        limit: filter.limit,
      },
      candidateIds: top.map((c) => c.userId),
      scores: top.map((c) => ({
        userId: c.userId,
        score: c.score,
        breakdown: c.breakdown,
      })),
    });

    this.logger.debug(
      `Matching generate requester=${command.requesterId} pool=${pool.length} top=${top.length} mode=${filter.mode} historyFallback=${historyFallbackApplied}`,
    );

    return {
      mode: filter.mode,
      totalScored: scored.length,
      candidates: top,
      historyFallbackApplied,
    };
  }

  private async loadPool(
    requesterId: string,
    preferredAlcoholLevels: AlcoholToleranceLevel[],
    excludeUserIds: string[],
  ): Promise<IUser[]> {
    return this.userRepository.findMatchingPool({
      excludeUserId: requesterId,
      alcoholToleranceLevels: preferredAlcoholLevels.length
        ? preferredAlcoholLevels
        : undefined,
      excludeUserIds,
      limit: MATCHING_POOL_LIMIT,
    });
  }
}

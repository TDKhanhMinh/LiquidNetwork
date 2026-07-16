import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IMatchingHistoryRepository } from '../../domain/repositories/matching-history.repository.interface';
import {
  IMatchingHistory,
  IMatchingHistoryFiltersSnapshot,
  IMatchingHistoryScoreEntry,
} from '../../domain/entities/matching-history.entity';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';

export interface RecordMatchingHistoryCommand {
  requesterId: string;
  mode: MatchingMode;
  filters: IMatchingHistoryFiltersSnapshot;
  candidateIds: string[];
  scores: IMatchingHistoryScoreEntry[];
}

@Injectable()
export class RecordMatchingHistoryUseCase {
  private readonly logger = new Logger(RecordMatchingHistoryUseCase.name);

  constructor(
    @Inject('IMatchingHistoryRepository')
    private readonly historyRepository: IMatchingHistoryRepository,
  ) {}

  /**
   * Best-effort: logs and swallows errors so generate flow is not blocked.
   */
  async execute(
    command: RecordMatchingHistoryCommand,
  ): Promise<IMatchingHistory | null> {
    try {
      return await this.historyRepository.create({
        requesterId: command.requesterId,
        mode: command.mode,
        filters: command.filters,
        candidateIds: command.candidateIds,
        scores: command.scores,
      });
    } catch (err) {
      this.logger.warn(
        `Failed to record matching history for ${command.requesterId}: ${String(err)}`,
      );
      return null;
    }
  }
}

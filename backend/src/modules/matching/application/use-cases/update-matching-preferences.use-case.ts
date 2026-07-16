import { Inject, Injectable } from '@nestjs/common';
import type { IMatchingPreferenceRepository } from '../../domain/repositories/matching-preference.repository.interface';
import { IMatchingPreference } from '../../domain/entities/matching-preference.entity';
import { UpdateMatchingPreferencesCommand } from '../dto/update-matching-preferences.command';
import {
  ABSOLUTE_MAX_CANDIDATES,
  DEFAULT_EXCLUDE_RECENT_DAYS,
  DEFAULT_MAX_CANDIDATES,
  DEFAULT_MAX_DISTANCE_KM,
} from '../../domain/constants/scoring.constants';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';

@Injectable()
export class UpdateMatchingPreferencesUseCase {
  constructor(
    @Inject('IMatchingPreferenceRepository')
    private readonly preferenceRepository: IMatchingPreferenceRepository,
  ) {}

  async execute(
    command: UpdateMatchingPreferencesCommand,
  ): Promise<IMatchingPreference> {
    if (command.preferredModes !== undefined) {
      if (!command.preferredModes.length) {
        throw new BadRequestException(
          'preferredModes must contain at least one mode',
          'INVALID_PREFERRED_MODES',
        );
      }
    }

    if (
      command.maxCandidates !== undefined &&
      (command.maxCandidates < 1 ||
        command.maxCandidates > ABSOLUTE_MAX_CANDIDATES)
    ) {
      throw new BadRequestException(
        `maxCandidates must be between 1 and ${ABSOLUTE_MAX_CANDIDATES}`,
        'INVALID_MAX_CANDIDATES',
      );
    }

    if (
      command.excludeRecentDays !== undefined &&
      (command.excludeRecentDays < 0 || command.excludeRecentDays > 90)
    ) {
      throw new BadRequestException(
        'excludeRecentDays must be between 0 and 90',
        'INVALID_EXCLUDE_RECENT_DAYS',
      );
    }

    if (
      command.maxDistanceKm !== undefined &&
      command.maxDistanceKm !== null &&
      (command.maxDistanceKm < 1 || command.maxDistanceKm > 500)
    ) {
      throw new BadRequestException(
        'maxDistanceKm must be between 1 and 500 (or null)',
        'INVALID_MAX_DISTANCE',
      );
    }

    const patch: Partial<IMatchingPreference> = {
      userId: command.userId,
    };

    if (command.preferredModes !== undefined) {
      patch.preferredModes = command.preferredModes;
    }
    if (command.preferredAlcoholLevels !== undefined) {
      patch.preferredAlcoholLevels = command.preferredAlcoholLevels;
    }
    if (command.preferredOccupations !== undefined) {
      patch.preferredOccupations = command.preferredOccupations
        .map((o) => o.trim())
        .filter(Boolean);
    }
    if (command.maxDistanceKm !== undefined) {
      patch.maxDistanceKm = command.maxDistanceKm;
    }
    if (command.maxCandidates !== undefined) {
      patch.maxCandidates = command.maxCandidates;
    }
    if (command.excludeRecentDays !== undefined) {
      patch.excludeRecentDays = command.excludeRecentDays;
    }

    const existing = await this.preferenceRepository.findByUserId(
      command.userId,
    );
    if (!existing) {
      return this.preferenceRepository.upsertByUserId(command.userId, {
        preferredModes: patch.preferredModes?.length
          ? patch.preferredModes
          : [MatchingMode.CASUAL],
        preferredAlcoholLevels: patch.preferredAlcoholLevels ?? [],
        preferredOccupations: patch.preferredOccupations ?? [],
        maxDistanceKm:
          patch.maxDistanceKm !== undefined
            ? patch.maxDistanceKm
            : DEFAULT_MAX_DISTANCE_KM,
        maxCandidates: patch.maxCandidates ?? DEFAULT_MAX_CANDIDATES,
        excludeRecentDays:
          patch.excludeRecentDays ?? DEFAULT_EXCLUDE_RECENT_DAYS,
      });
    }

    return this.preferenceRepository.upsertByUserId(command.userId, patch);
  }
}

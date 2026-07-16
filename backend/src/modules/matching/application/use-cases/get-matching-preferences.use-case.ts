import { Inject, Injectable } from '@nestjs/common';
import type { IMatchingPreferenceRepository } from '../../domain/repositories/matching-preference.repository.interface';
import { IMatchingPreference } from '../../domain/entities/matching-preference.entity';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import {
  DEFAULT_EXCLUDE_RECENT_DAYS,
  DEFAULT_MAX_CANDIDATES,
  DEFAULT_MAX_DISTANCE_KM,
} from '../../domain/constants/scoring.constants';

export function defaultMatchingPreferences(
  userId: string,
): IMatchingPreference {
  return {
    userId,
    preferredModes: [MatchingMode.CASUAL],
    preferredAlcoholLevels: [],
    preferredOccupations: [],
    maxDistanceKm: DEFAULT_MAX_DISTANCE_KM,
    maxCandidates: DEFAULT_MAX_CANDIDATES,
    excludeRecentDays: DEFAULT_EXCLUDE_RECENT_DAYS,
  };
}

@Injectable()
export class GetMatchingPreferencesUseCase {
  constructor(
    @Inject('IMatchingPreferenceRepository')
    private readonly preferenceRepository: IMatchingPreferenceRepository,
  ) {}

  async execute(userId: string): Promise<IMatchingPreference> {
    const existing = await this.preferenceRepository.findByUserId(userId);
    return existing ?? defaultMatchingPreferences(userId);
  }
}

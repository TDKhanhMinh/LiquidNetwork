import { CalculateCompatibilityScoreUseCase } from './calculate-compatibility-score.use-case';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

describe('CalculateCompatibilityScoreUseCase', () => {
  let useCase: CalculateCompatibilityScoreUseCase;
  let userRepository: any;
  let scoringService: any;
  let getPreferences: any;

  const requester = {
    _id: 'req-1',
    name: 'Host',
    alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_2,
    privacySettings: { hideProfile: false, hideLevel: false },
    drunkProfile: {},
  };

  const candidate = {
    _id: 'cand-1',
    name: 'Guest',
    alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_2,
    privacySettings: { hideProfile: false, hideLevel: false },
    drunkProfile: { occupation: 'Dev' },
    averageRating: 4,
    totalReviews: 3,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'req-1') return requester;
        if (id === 'cand-1') return candidate;
        return null;
      }),
    };
    scoringService = {
      scorePair: jest.fn().mockReturnValue({
        score: 88,
        breakdown: {},
        breakdownPercent: {
          level: 100,
          mode: 100,
          reputation: 80,
          activity: 100,
          occupation: 100,
        },
      }),
    };
    getPreferences = {
      execute: jest.fn().mockResolvedValue({
        preferredModes: [MatchingMode.CASUAL],
        preferredOccupations: [],
      }),
    };
    useCase = new CalculateCompatibilityScoreUseCase(
      userRepository,
      scoringService,
      getPreferences,
    );
  });

  it('rejects self scoring', async () => {
    await expect(
      useCase.execute({ requesterId: 'req-1', candidateId: 'req-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when candidate missing', async () => {
    await expect(
      useCase.execute({ requesterId: 'req-1', candidateId: 'nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns score and breakdown', async () => {
    const result = await useCase.execute({
      requesterId: 'req-1',
      candidateId: 'cand-1',
      mode: MatchingMode.NETWORKING,
    });

    expect(result.score).toBe(88);
    expect(result.candidate.id).toBe('cand-1');
    expect(result.mode).toBe(MatchingMode.NETWORKING);
    expect(scoringService.scorePair).toHaveBeenCalled();
  });
});

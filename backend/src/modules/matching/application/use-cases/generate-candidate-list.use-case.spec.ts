import { GenerateCandidateListUseCase } from './generate-candidate-list.use-case';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

describe('GenerateCandidateListUseCase', () => {
  let useCase: GenerateCandidateListUseCase;
  let userRepository: any;
  let historyRepository: any;
  let getPreferences: any;
  let recordHistory: any;
  let scoringService: any;

  const requester = {
    _id: 'req-1',
    name: 'Host',
    alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_2,
    averageRating: 4,
    totalReviews: 5,
    privacySettings: { hideProfile: false, hideLevel: false },
    drunkProfile: { occupation: 'PM' },
    updatedAt: new Date(),
  };

  const candidates = [
    {
      _id: 'c-high',
      name: 'High',
      alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_2,
      averageRating: 5,
      totalReviews: 10,
      privacySettings: { hideProfile: false, hideLevel: false },
      drunkProfile: { occupation: 'Engineer' },
      updatedAt: new Date(),
    },
    {
      _id: 'c-low',
      name: 'Low',
      alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_4,
      averageRating: 1,
      totalReviews: 10,
      privacySettings: { hideProfile: false, hideLevel: true },
      drunkProfile: { occupation: 'Chef' },
      updatedAt: new Date('2020-01-01'),
    },
  ];

  beforeEach(() => {
    userRepository = {
      findById: jest.fn().mockResolvedValue(requester),
      findMatchingPool: jest.fn().mockResolvedValue(candidates),
    };
    historyRepository = {
      findRecentCandidateIds: jest.fn().mockResolvedValue([]),
    };
    getPreferences = {
      execute: jest.fn().mockResolvedValue({
        userId: 'req-1',
        preferredModes: [MatchingMode.CASUAL],
        preferredAlcoholLevels: [],
        preferredOccupations: [],
        maxCandidates: 20,
        excludeRecentDays: 7,
      }),
    };
    recordHistory = {
      execute: jest.fn().mockResolvedValue(null),
    };
    scoringService = {
      scorePair: jest.fn().mockImplementation(({ candidate }) => {
        if (String(candidate._id) === 'c-high') {
          return {
            score: 90,
            breakdown: {},
            breakdownPercent: {
              level: 100,
              mode: 100,
              reputation: 100,
              activity: 100,
              occupation: 100,
            },
          };
        }
        return {
          score: 40,
          breakdown: {},
          breakdownPercent: {
            level: 20,
            mode: 100,
            reputation: 20,
            activity: 0,
            occupation: 100,
          },
        };
      }),
    };

    useCase = new GenerateCandidateListUseCase(
      userRepository,
      historyRepository,
      getPreferences,
      recordHistory,
      scoringService,
    );
  });

  it('throws when requester missing', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ requesterId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns ranked candidates and records history', async () => {
    const result = await useCase.execute({
      requesterId: 'req-1',
      limit: 10,
    });

    expect(result.totalScored).toBe(2);
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].userId).toBe('c-high');
    expect(result.candidates[0].score).toBe(90);
    expect(result.candidates[1].alcoholToleranceLevel).toBeUndefined();
    expect(result.historyFallbackApplied).toBe(false);
    expect(recordHistory.execute).toHaveBeenCalled();
    expect(userRepository.findMatchingPool).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeUserId: 'req-1',
        limit: 200,
      }),
    );
  });

  it('merges exclude from history into pool query', async () => {
    historyRepository.findRecentCandidateIds.mockResolvedValue(['old-1']);
    await useCase.execute({
      requesterId: 'req-1',
      excludeUserIds: ['x-1'],
      excludeRecentDays: 7,
      limit: 2,
    });

    expect(userRepository.findMatchingPool).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeUserIds: expect.arrayContaining(['x-1', 'old-1']),
      }),
    );
  });

  it('retries without history excludes when pool is thin', async () => {
    historyRepository.findRecentCandidateIds.mockResolvedValue(['old-1', 'old-2']);
    userRepository.findMatchingPool
      .mockResolvedValueOnce([]) // first: history wiped pool
      .mockResolvedValueOnce(candidates); // fallback

    const result = await useCase.execute({
      requesterId: 'req-1',
      limit: 10,
      excludeRecentDays: 7,
    });

    expect(userRepository.findMatchingPool).toHaveBeenCalledTimes(2);
    expect(result.historyFallbackApplied).toBe(true);
    expect(result.candidates).toHaveLength(2);
    // second call should only use client excludes (none)
    expect(userRepository.findMatchingPool.mock.calls[1][0].excludeUserIds).toEqual(
      [],
    );
  });

  it('respects limit', async () => {
    const result = await useCase.execute({
      requesterId: 'req-1',
      limit: 1,
    });
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].userId).toBe('c-high');
  });
});

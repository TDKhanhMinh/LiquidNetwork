import { UpdateMatchingPreferencesUseCase } from './update-matching-preferences.use-case';
import { MatchingMode } from '../../domain/enums/matching-mode.enum';
import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';

describe('UpdateMatchingPreferencesUseCase', () => {
  let useCase: UpdateMatchingPreferencesUseCase;
  let preferenceRepository: any;

  beforeEach(() => {
    preferenceRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
      upsertByUserId: jest.fn().mockImplementation(async (userId, data) => ({
        userId,
        ...data,
      })),
    };
    useCase = new UpdateMatchingPreferencesUseCase(preferenceRepository);
  });

  it('rejects empty preferredModes', async () => {
    await expect(
      useCase.execute({
        userId: 'u1',
        preferredModes: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates defaults on first insert', async () => {
    const result = await useCase.execute({
      userId: 'u1',
      preferredAlcoholLevels: [AlcoholToleranceLevel.LEVEL_2],
    });

    expect(preferenceRepository.upsertByUserId).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        preferredModes: [MatchingMode.CASUAL],
        preferredAlcoholLevels: [AlcoholToleranceLevel.LEVEL_2],
        maxCandidates: 20,
      }),
    );
    expect(result.userId).toBe('u1');
  });

  it('patches existing preferences', async () => {
    preferenceRepository.findByUserId.mockResolvedValue({
      userId: 'u1',
      preferredModes: [MatchingMode.CASUAL],
      preferredAlcoholLevels: [],
      preferredOccupations: [],
      maxCandidates: 20,
      excludeRecentDays: 7,
    });

    await useCase.execute({
      userId: 'u1',
      preferredModes: [MatchingMode.NETWORKING],
      maxCandidates: 10,
    });

    expect(preferenceRepository.upsertByUserId).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        preferredModes: [MatchingMode.NETWORKING],
        maxCandidates: 10,
      }),
    );
  });

  it('rejects invalid maxCandidates', async () => {
    await expect(
      useCase.execute({ userId: 'u1', maxCandidates: 100 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

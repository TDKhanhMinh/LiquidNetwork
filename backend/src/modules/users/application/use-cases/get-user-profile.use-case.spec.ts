import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let findUserByIdUseCase: any;

  const baseUser = {
    _id: 'user-a',
    name: 'Alice',
    email: 'alice@example.com',
    alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_2,
    privacySettings: { hideProfile: false, hideLevel: false },
  };

  beforeEach(() => {
    findUserByIdUseCase = {
      execute: jest.fn(),
    };
    useCase = new GetUserProfileUseCase(findUserByIdUseCase);
  });

  it('returns owner access with includeLevel', async () => {
    findUserByIdUseCase.execute.mockResolvedValue(baseUser);

    const result = await useCase.execute('user-a', 'user-a');

    expect(result.isOwner).toBe(true);
    expect(result.includeLevel).toBe(true);
    expect(result.user).toBe(baseUser);
  });

  it('throws when profile is hidden from non-owner', async () => {
    findUserByIdUseCase.execute.mockResolvedValue({
      ...baseUser,
      privacySettings: { hideProfile: true, hideLevel: false },
    });

    await expect(useCase.execute('user-a', 'user-b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('sets includeLevel false when hideLevel and non-owner', async () => {
    findUserByIdUseCase.execute.mockResolvedValue({
      ...baseUser,
      privacySettings: { hideProfile: false, hideLevel: true },
    });

    const result = await useCase.execute('user-a', 'user-b');

    expect(result.isOwner).toBe(false);
    expect(result.includeLevel).toBe(false);
  });
});

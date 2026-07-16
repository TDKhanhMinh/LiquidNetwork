import { UpdatePrivacySettingsUseCase } from './update-privacy-settings.use-case';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

describe('UpdatePrivacySettingsUseCase', () => {
  let useCase: UpdatePrivacySettingsUseCase;
  let userRepository: any;
  let findUserByIdUseCase: any;

  beforeEach(() => {
    userRepository = {
      updateById: jest.fn(),
    };
    findUserByIdUseCase = {
      execute: jest.fn().mockResolvedValue({
        _id: 'user-a',
        privacySettings: { hideProfile: false, hideLevel: false },
      }),
    };
    useCase = new UpdatePrivacySettingsUseCase(
      userRepository,
      findUserByIdUseCase,
    );
  });

  it('merges partial privacy flags', async () => {
    userRepository.updateById.mockResolvedValue({
      _id: 'user-a',
      privacySettings: { hideProfile: true, hideLevel: false },
    });

    const result = await useCase.execute('user-a', {
      privacySettings: { hideProfile: true },
    });

    expect(userRepository.updateById).toHaveBeenCalledWith('user-a', {
      privacySettings: { hideProfile: true, hideLevel: false },
    });
    expect(result.privacySettings.hideProfile).toBe(true);
  });

  it('throws when update returns null', async () => {
    userRepository.updateById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-a', {
        privacySettings: { hideLevel: true },
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

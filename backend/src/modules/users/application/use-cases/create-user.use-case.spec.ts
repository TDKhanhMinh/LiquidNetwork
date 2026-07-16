import { CreateUserUseCase } from './create-user.use-case';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: any;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    useCase = new CreateUserUseCase(userRepository);
  });

  it('creates user with LiquidNetwork defaults', async () => {
    userRepository.findOne.mockResolvedValue(null);
    userRepository.create.mockImplementation(async (data: any) => ({
      _id: 'new-id',
      ...data,
    }));

    const user = await useCase.execute({
      name: 'Alice',
      email: 'alice@example.com',
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alice',
        email: 'alice@example.com',
        isEmailVerified: false,
        alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_1,
        privacySettings: { hideProfile: false, hideLevel: false },
        sessionsJoined: 0,
      }),
    );
    expect(user._id).toBe('new-id');
  });

  it('throws on duplicate email', async () => {
    userRepository.findOne.mockResolvedValue({ _id: 'existing' });

    await expect(
      useCase.execute({ name: 'Alice', email: 'alice@example.com' }),
    ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
  });
});

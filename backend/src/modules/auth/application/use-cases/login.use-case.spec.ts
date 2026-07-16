import { LoginUseCase } from './login.use-case';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: any;
  let authAccountRepository: any;
  let refreshTokenRepository: any;
  let passwordService: any;
  let tokenService: any;

  const activeUser = {
    _id: 'user-id',
    name: 'Alice',
    email: 'alice@example.com',
    isDeleted: false,
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };
    authAccountRepository = {
      findByUserId: jest.fn(),
    };
    refreshTokenRepository = {
      create: jest.fn().mockResolvedValue({}),
    };
    passwordService = {
      comparePassword: jest.fn(),
    };
    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('user-id:raw-refresh'),
      hashRefreshToken: jest.fn().mockResolvedValue('hashed-refresh'),
    };

    useCase = new LoginUseCase(
      userRepository,
      authAccountRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
    );
  });

  it('logs in with valid credentials', async () => {
    userRepository.findOne.mockResolvedValue(activeUser);
    authAccountRepository.findByUserId.mockResolvedValue({ password: 'hash' });
    passwordService.comparePassword.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.id).toBe('user-id');
    expect(refreshTokenRepository.create).toHaveBeenCalled();
  });

  it('rejects unknown email', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@example.com', password: 'password123' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('rejects soft-deleted user', async () => {
    userRepository.findOne.mockResolvedValue({ ...activeUser, isDeleted: true });

    await expect(
      useCase.execute({ email: 'alice@example.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects wrong password', async () => {
    userRepository.findOne.mockResolvedValue(activeUser);
    authAccountRepository.findByUserId.mockResolvedValue({ password: 'hash' });
    passwordService.comparePassword.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'alice@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});

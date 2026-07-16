import { RegisterUseCase } from './register.use-case';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { DatabaseException } from '../../../../shared/common/exceptions/database.exception';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: any;
  let createUserUseCase: any;
  let authAccountRepository: any;
  let refreshTokenRepository: any;
  let passwordService: any;
  let tokenService: any;

  beforeEach(() => {
    userRepository = {
      deleteById: jest.fn(),
    };
    createUserUseCase = {
      execute: jest.fn(),
    };
    authAccountRepository = {
      create: jest.fn(),
    };
    refreshTokenRepository = {
      create: jest.fn(),
    };
    passwordService = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };
    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('user-id:raw-refresh'),
      hashRefreshToken: jest.fn().mockResolvedValue('hashed-refresh'),
    };

    useCase = new RegisterUseCase(
      userRepository,
      createUserUseCase,
      authAccountRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
    );
  });

  it('registers a new user via CreateUserUseCase and returns tokens', async () => {
    createUserUseCase.execute.mockResolvedValue({
      _id: 'user-id',
      name: 'Alice',
      email: 'alice@example.com',
    });
    authAccountRepository.create.mockResolvedValue({});
    refreshTokenRepository.create.mockResolvedValue({});

    const result = await useCase.execute({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(createUserUseCase.execute).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      isEmailVerified: false,
    });
    expect(passwordService.hashPassword).toHaveBeenCalledWith('password123');
    expect(authAccountRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      user: { id: 'user-id', name: 'Alice', email: 'alice@example.com' },
      accessToken: 'access-token',
      refreshToken: 'user-id:raw-refresh',
    });
  });

  it('propagates email conflict from CreateUserUseCase', async () => {
    createUserUseCase.execute.mockRejectedValue(
      new ConflictException('Email already in use', 'EMAIL_ALREADY_EXISTS'),
    );

    await expect(
      useCase.execute({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(authAccountRepository.create).not.toHaveBeenCalled();
  });

  it('hard-deletes user when auth account creation fails', async () => {
    createUserUseCase.execute.mockResolvedValue({
      _id: 'user-id',
      name: 'Alice',
      email: 'alice@example.com',
    });
    authAccountRepository.create.mockRejectedValue(new Error('db down'));
    userRepository.deleteById.mockResolvedValue(true);

    await expect(
      useCase.execute({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(DatabaseException);

    expect(userRepository.deleteById).toHaveBeenCalledWith('user-id', false);
  });
});

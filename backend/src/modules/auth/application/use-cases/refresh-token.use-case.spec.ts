import { RefreshTokenUseCase } from './refresh-token.use-case';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: any;
  let refreshTokenRepository: any;
  let tokenService: any;

  const userId = 'user-id';
  const rawRefresh = `${userId}:raw-token`;
  const activeUser = {
    _id: userId,
    email: 'alice@example.com',
    isDeleted: false,
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn().mockResolvedValue(activeUser),
    };
    refreshTokenRepository = {
      findAll: jest.fn(),
      revokeAllForUser: jest.fn(),
      updateById: jest.fn(),
      create: jest.fn(),
    };
    tokenService = {
      verifyRefreshToken: jest.fn(),
      generateAccessToken: jest.fn().mockReturnValue('new-access'),
      generateRefreshToken: jest.fn().mockReturnValue(`${userId}:new-raw`),
      hashRefreshToken: jest.fn().mockResolvedValue('new-hash'),
    };

    useCase = new RefreshTokenUseCase(
      userRepository,
      refreshTokenRepository,
      tokenService,
    );
  });

  it('rotates refresh token on success', async () => {
    const future = new Date(Date.now() + 60_000);
    refreshTokenRepository.findAll.mockResolvedValue([
      {
        _id: 'token-record-1',
        token: 'stored-hash',
        isRevoked: false,
        expiresAt: future,
      },
    ]);
    tokenService.verifyRefreshToken.mockResolvedValue(true);

    const result = await useCase.execute({ refreshToken: rawRefresh });

    expect(refreshTokenRepository.updateById).toHaveBeenCalledWith(
      'token-record-1',
      expect.objectContaining({ isRevoked: true }),
    );
    expect(refreshTokenRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: `${userId}:new-raw`,
    });
  });

  it('rejects invalid format', async () => {
    await expect(
      useCase.execute({ refreshToken: 'not-a-valid-token' }),
    ).rejects.toMatchObject({ code: 'INVALID_REFRESH_TOKEN' });
  });

  it('detects reuse of revoked token and revokes all sessions', async () => {
    refreshTokenRepository.findAll.mockResolvedValue([
      {
        _id: 'token-record-1',
        token: 'stored-hash',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
    tokenService.verifyRefreshToken.mockResolvedValue(true);

    await expect(
      useCase.execute({ refreshToken: rawRefresh }),
    ).rejects.toMatchObject({ code: 'TOKEN_REUSE_DETECTED' });

    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(userId);
  });

  it('rejects expired refresh token', async () => {
    refreshTokenRepository.findAll.mockResolvedValue([
      {
        _id: 'token-record-1',
        token: 'stored-hash',
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000),
      },
    ]);
    tokenService.verifyRefreshToken.mockResolvedValue(true);

    await expect(
      useCase.execute({ refreshToken: rawRefresh }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when user no longer exists', async () => {
    refreshTokenRepository.findAll.mockResolvedValue([
      {
        _id: 'token-record-1',
        token: 'stored-hash',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
    tokenService.verifyRefreshToken.mockResolvedValue(true);
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ refreshToken: rawRefresh }),
    ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });
});

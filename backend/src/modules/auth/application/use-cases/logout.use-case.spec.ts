import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let refreshTokenRepository: any;
  let tokenService: any;

  beforeEach(() => {
    refreshTokenRepository = {
      findAll: jest.fn(),
      updateById: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    tokenService = {
      verifyRefreshToken: jest.fn(),
    };

    useCase = new LogoutUseCase(refreshTokenRepository, tokenService);
  });

  it('revokes a specific refresh token when provided and valid', async () => {
    refreshTokenRepository.findAll.mockResolvedValue([
      { _id: 'tok-1', token: 'hash-1' },
    ]);
    tokenService.verifyRefreshToken.mockResolvedValue(true);

    const result = await useCase.execute('user-id', 'user-id:raw');

    expect(refreshTokenRepository.updateById).toHaveBeenCalledWith(
      'tok-1',
      expect.objectContaining({ isRevoked: true }),
    );
    expect(result).toEqual({ success: true });
    expect(refreshTokenRepository.revokeAllForUser).not.toHaveBeenCalled();
  });

  it('revokes all tokens when no refresh token is provided', async () => {
    const result = await useCase.execute('user-id');

    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-id');
    expect(result).toEqual({ success: true });
  });

  it('falls back to revoke all when specific token is not found', async () => {
    refreshTokenRepository.findAll.mockResolvedValue([
      { _id: 'tok-1', token: 'hash-1' },
    ]);
    tokenService.verifyRefreshToken.mockResolvedValue(false);

    await useCase.execute('user-id', 'user-id:unknown');

    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-id');
  });
});

import { GoogleLoginUseCase } from './google-login.use-case';

describe('GoogleLoginUseCase', () => {
  it('returns 501-style domain error when Google auth is disabled', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(false),
    } as any;

    const useCase = new GoogleLoginUseCase(configService);

    await expect(useCase.execute({ token: 'fake-google-token' })).rejects.toMatchObject({
      code: 'GOOGLE_AUTH_DISABLED',
      statusCode: 501,
    });
  });

  it('returns NOT_IMPLEMENTED when enabled but flow is unfinished', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(true),
    } as any;

    const useCase = new GoogleLoginUseCase(configService);

    await expect(useCase.execute({ token: 'fake-google-token' })).rejects.toMatchObject({
      code: 'NOT_IMPLEMENTED',
    });
  });
});

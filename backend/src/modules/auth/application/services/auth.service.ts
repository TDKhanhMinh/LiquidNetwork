import { Injectable } from '@nestjs/common';
import { ILoginInput } from '../dto/login.input';
import { IGoogleLoginInput } from '../dto/google-login.input';
import { IRefreshTokenInput } from '../dto/refresh-token.input';
import { IRegisterInput } from '../dto/register.input';
import { GoogleLoginUseCase } from '../use-cases/google-login.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
  ) {}

  register(input: IRegisterInput) {
    return this.registerUseCase.execute(input);
  }

  login(input: ILoginInput) {
    return this.loginUseCase.execute(input);
  }

  refreshToken(input: IRefreshTokenInput) {
    return this.refreshTokenUseCase.execute(input);
  }

  logout(userId: string, refreshToken?: string) {
    return this.logoutUseCase.execute(userId, refreshToken);
  }

  googleLogin(input: IGoogleLoginInput) {
    return this.googleLoginUseCase.execute(input);
  }
}

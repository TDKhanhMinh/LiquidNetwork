import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IAuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import type { IPasswordService } from '../../domain/services/password.service.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';
import { ILoginInput } from '../dto/login.input';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuthAccountRepository')
    private readonly authAccountRepository: IAuthAccountRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: ILoginInput) {
    // Base repository excludes soft-deleted users by default.
    // Explicit isDeleted check kept as a safety net if repository behavior changes.
    const user = await this.userRepository.findOne({ email: input.email });
    if (!user || !user._id || user.isDeleted) {
      throw new UnauthorizedException(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    const userId = (user._id as any).toString?.() ?? user._id;

    const authAccount = await this.authAccountRepository.findByUserId(userId);
    if (!authAccount || !authAccount.password) {
      throw new UnauthorizedException(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      input.password,
      authAccount.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
      );
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: userId,
      email: user.email,
    });
    const refreshTokenString = this.tokenService.generateRefreshToken(userId);
    const hashedRefreshToken =
      await this.tokenService.hashRefreshToken(refreshTokenString);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt,
      isRevoked: false,
    });

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}

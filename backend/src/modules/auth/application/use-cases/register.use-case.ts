import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IAuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface';
import type { IPasswordService } from '../../domain/services/password.service.interface';
import { IRegisterInput } from '../dto/register.input';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import type { ITokenService } from '../../domain/services/token.service.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class RegisterUseCase {
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

  async execute(input: IRegisterInput) {
    // 1. Check if email exists in Users collection
    const existingUser = await this.userRepository.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictException('Email already in use', 'EMAIL_ALREADY_EXISTS');
    }

    const user = await this.userRepository.create({
      email: input.email,
      name: input.name,
      isEmailVerified: false,
    });

    // 3. Hash password
    const hashedPassword = await this.passwordService.hashPassword(input.password);

    await this.authAccountRepository.create({
      userId: user._id,
      password: hashedPassword,
    });

    const accessToken = this.tokenService.generateAccessToken({ sub: user._id, email: user.email });
    const refreshTokenString = this.tokenService.generateRefreshToken(user._id as string);
    const hashedRefreshToken = await this.tokenService.hashRefreshToken(refreshTokenString);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await this.refreshTokenRepository.create({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt,
      isRevoked: false,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}

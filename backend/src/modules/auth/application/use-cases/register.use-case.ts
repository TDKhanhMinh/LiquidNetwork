import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IAuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface';
import type { IPasswordService } from '../../domain/services/password.service.interface';
import { IRegisterInput } from '../dto/register.input';
import type { ITokenService } from '../../domain/services/token.service.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { DatabaseException } from '../../../../shared/common/exceptions/database.exception';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
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
    // Email uniqueness + default profile fields live in CreateUserUseCase
    const user = await this.createUserUseCase.execute({
      email: input.email,
      name: input.name,
      isEmailVerified: false,
    });

    const userId = (user as any)._id?.toString?.() ?? (user as any)._id;

    try {
      const hashedPassword = await this.passwordService.hashPassword(
        input.password,
      );

      await this.authAccountRepository.create({
        userId: (user as any)._id,
        password: hashedPassword,
      });
    } catch (error) {
      // Compensate: avoid orphan users without auth credentials
      this.logger.error(
        `Auth account creation failed for user ${userId}; compensating with hard delete`,
        error instanceof Error ? error.stack : undefined,
      );
      try {
        await this.userRepository.deleteById(userId, false);
      } catch (cleanupError) {
        this.logger.error(
          `Failed to hard-delete orphan user ${userId}`,
          cleanupError instanceof Error ? cleanupError.stack : undefined,
        );
      }
      throw new DatabaseException(
        'Failed to complete registration. Please try again.',
        'REGISTRATION_FAILED',
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
      userId: (user as any)._id,
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

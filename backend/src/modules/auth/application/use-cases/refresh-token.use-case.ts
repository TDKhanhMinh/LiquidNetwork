import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';
import { IRefreshTokenInput } from '../dto/refresh-token.input';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: IRefreshTokenInput) {
    const parts = input.refreshToken.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid refresh token format', 'INVALID_REFRESH_TOKEN');
    }
    const [userId, rawToken] = parts;
    
    // Find all tokens for this user to check for reuse
    const tokens = await this.refreshTokenRepository.findAll({ userId });
    
    let validTokenRecord = null;
    let reusedRevokedToken = false;

    for (const record of tokens) {
      if (await this.tokenService.verifyRefreshToken(input.refreshToken, record.token)) {
        if (record.isRevoked) {
          reusedRevokedToken = true;
        } else {
          validTokenRecord = record;
        }
        break;
      }
    }

    if (reusedRevokedToken) {
      // REUSE DETECTED! Revoke all tokens for this user
      await this.refreshTokenRepository.revokeAllForUser(userId);
      throw new UnauthorizedException('Security alert: Refresh token reuse detected. All sessions revoked.', 'TOKEN_REUSE_DETECTED');
    }

    if (!validTokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    if (new Date() > validTokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
    }

    // Refresh token rotation: Revoke old token
    await this.refreshTokenRepository.updateById(validTokenRecord._id as string, { 
      isRevoked: true,
      revokedAt: new Date()
    });

    // Verify user still exists and not deleted
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User no longer exists', 'USER_NOT_FOUND');
    }

    const resolvedUserId = (user as any)._id?.toString?.() ?? (user as any)._id;

    // Generate new tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: resolvedUserId,
      email: user.email,
    });
    const newRefreshTokenString =
      this.tokenService.generateRefreshToken(resolvedUserId);
    const hashedNewRefreshToken =
      await this.tokenService.hashRefreshToken(newRefreshTokenString);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      userId: (user as any)._id,
      token: hashedNewRefreshToken,
      expiresAt,
      isRevoked: false,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
    };
  }
}

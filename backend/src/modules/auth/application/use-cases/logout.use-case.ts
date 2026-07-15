import { Injectable, Inject } from '@nestjs/common';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Logic to revoke a specific refresh token
      const parts = refreshToken.split(':');
      if (parts.length === 2 && parts[0] === userId) {
        const tokens = await this.refreshTokenRepository.findAll({ userId, isRevoked: false });
        for (const record of tokens) {
          if (await this.tokenService.verifyRefreshToken(refreshToken, record.token)) {
            await this.refreshTokenRepository.updateById(record._id as string, { 
              isRevoked: true,
              revokedAt: new Date()
            });
            return { success: true };
          }
        }
      }
    }
    
    // Fallback: Revoke all refresh tokens for this user across all devices
    await this.refreshTokenRepository.revokeAllForUser(userId);
    return { success: true };
  }
}

import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IRefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository extends IBaseRepository<IRefreshToken> {
  revokeAllForUser(userId: string): Promise<void>;
  findByToken(token: string): Promise<IRefreshToken | null>;
}

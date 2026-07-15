import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken, RefreshTokenDocument } from '../schemas/refresh-token.schema';
import { IRefreshToken } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenMongooseRepository
  extends BaseRepository<RefreshTokenDocument>
  implements IRefreshTokenRepository
{
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {
    super(refreshTokenModel);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId }, 
      { isRevoked: true, revokedAt: new Date() }
    ).exec();
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    const doc = await this.findOne({ token, isRevoked: false });
    return doc as unknown as IRefreshToken | null;
  }
}

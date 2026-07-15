import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IAuthAccountRepository } from '../../../domain/repositories/auth-account.repository.interface';
import { AuthAccount, AuthAccountDocument } from '../schemas/auth-account.schema';
import { IAuthAccount } from '../../../domain/entities/auth-account.entity';

@Injectable()
export class AuthAccountMongooseRepository
  extends BaseRepository<AuthAccountDocument>
  implements IAuthAccountRepository
{
  constructor(
    @InjectModel(AuthAccount.name)
    private readonly authAccountModel: Model<AuthAccountDocument>,
  ) {
    super(authAccountModel);
  }

  async findByUserId(userId: string): Promise<IAuthAccount | null> {
    const doc = await this.findOne({ userId });
    return doc as unknown as IAuthAccount | null;
  }
}

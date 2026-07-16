import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IMatchingPreferenceRepository } from '../../../domain/repositories/matching-preference.repository.interface';
import { IMatchingPreference } from '../../../domain/entities/matching-preference.entity';
import {
  MatchingPreference,
  MatchingPreferenceDocument,
} from '../schemas/matching-preference.schema';

@Injectable()
export class MatchingPreferenceMongooseRepository
  extends BaseRepository<MatchingPreferenceDocument>
  implements IMatchingPreferenceRepository
{
  constructor(
    @InjectModel(MatchingPreference.name)
    model: Model<MatchingPreferenceDocument>,
  ) {
    super(model);
  }

  async findByUserId(userId: string): Promise<IMatchingPreference | null> {
    return this.model
      .findOne(this.enrichFilter({ userId }))
      .exec() as Promise<IMatchingPreference | null>;
  }

  async upsertByUserId(
    userId: string,
    data: Partial<IMatchingPreference>,
  ): Promise<IMatchingPreference> {
    const { userId: _u, _id, createdAt, updatedAt, ...rest } = data as any;
    const updated = await this.model
      .findOneAndUpdate(
        { userId, isDeleted: { $ne: true } },
        {
          $set: { ...rest, userId },
          $setOnInsert: { isDeleted: false },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
    return updated as unknown as IMatchingPreference;
  }
}

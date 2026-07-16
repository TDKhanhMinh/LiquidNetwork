import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IMatchingHistoryRepository } from '../../../domain/repositories/matching-history.repository.interface';
import {
  MatchingHistory,
  MatchingHistoryDocument,
} from '../schemas/matching-history.schema';

@Injectable()
export class MatchingHistoryMongooseRepository
  extends BaseRepository<MatchingHistoryDocument>
  implements IMatchingHistoryRepository
{
  constructor(
    @InjectModel(MatchingHistory.name)
    model: Model<MatchingHistoryDocument>,
  ) {
    super(model);
  }

  async findRecentCandidateIds(
    requesterId: string,
    since: Date,
  ): Promise<string[]> {
    const docs = await this.model
      .find({
        requesterId,
        isDeleted: { $ne: true },
        createdAt: { $gte: since },
      })
      .select({ candidateIds: 1 })
      .lean()
      .exec();

    const ids = new Set<string>();
    for (const doc of docs) {
      for (const id of doc.candidateIds ?? []) {
        ids.add(String(id));
      }
    }
    return [...ids];
  }
}

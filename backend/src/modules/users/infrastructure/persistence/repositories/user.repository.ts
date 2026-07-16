import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IUser } from '../../../domain/interfaces/user.interface';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async searchCandidates(
    query: string,
    excludeUserId: string,
    limit = 20,
  ): Promise<IUser[]> {
    const filter: Record<string, unknown> = {
      isDeleted: { $ne: true },
      'privacySettings.hideProfile': { $ne: true },
    };

    if (Types.ObjectId.isValid(excludeUserId)) {
      filter._id = { $ne: new Types.ObjectId(excludeUserId) };
    } else {
      filter._id = { $ne: excludeUserId };
    }

    const q = query?.trim();
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { 'drunkProfile.occupation': { $regex: escaped, $options: 'i' } },
      ];
    }

    return this.model
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(Math.min(50, Math.max(1, limit)))
      .exec() as Promise<IUser[]>;
  }

  async findByIds(ids: string[]): Promise<IUser[]> {
    if (!ids.length) return [];

    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (!objectIds.length) return [];

    return this.model
      .find({
        _id: { $in: objectIds },
        isDeleted: { $ne: true },
      })
      .exec() as Promise<IUser[]>;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IInvitationRepository } from '../../../domain/repositories/invitation.repository.interface';
import { IInvitation } from '../../../domain/entities/invitation.entity';
import { InvitationStatus } from '../../../domain/enums/invitation-status.enum';
import { Invitation, InvitationDocument } from '../schemas/invitation.schema';

@Injectable()
export class InvitationMongooseRepository
  extends BaseRepository<InvitationDocument>
  implements IInvitationRepository
{
  constructor(
    @InjectModel(Invitation.name)
    model: Model<InvitationDocument>,
  ) {
    super(model);
  }

  async findByQueueAndInvitee(
    queueId: string,
    toUserId: string,
  ): Promise<IInvitation | null> {
    return this.model
      .findOne(this.enrichFilter({ queueId, toUserId }))
      .exec() as Promise<IInvitation | null>;
  }

  async findHistoryForUser(
    userId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{
    sent: IInvitation[];
    received: IInvitation[];
    sentTotal: number;
    receivedTotal: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 50));
    const skip = (page - 1) * limit;

    const sentFilter = this.enrichFilter({ fromUserId: userId });
    const receivedFilter = this.enrichFilter({ toUserId: userId });

    const [sent, received, sentTotal, receivedTotal] = await Promise.all([
      this.model
        .find(sentFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec() as Promise<IInvitation[]>,
      this.model
        .find(receivedFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec() as Promise<IInvitation[]>,
      this.model.countDocuments(sentFilter).exec(),
      this.model.countDocuments(receivedFilter).exec(),
    ]);

    return { sent, received, sentTotal, receivedTotal, page, limit };
  }

  async cancelPendingByQueueId(queueId: string): Promise<void> {
    await this.model
      .updateMany(
        this.enrichFilter({
          queueId,
          status: InvitationStatus.PENDING,
        }),
        {
          $set: {
            status: InvitationStatus.CANCELLED,
            respondedAt: new Date(),
            expiresAt: null,
          },
        },
      )
      .exec();
  }

  async deleteAllByQueueId(queueId: string): Promise<void> {
    await this.model.deleteMany({ queueId }).exec();
  }

  async updateStatusByQueueAndInvitee(
    queueId: string,
    toUserId: string,
    status: InvitationStatus,
    extras?: Partial<Pick<IInvitation, 'expiresAt' | 'respondedAt'>>,
  ): Promise<IInvitation | null> {
    return this.model
      .findOneAndUpdate(
        this.enrichFilter({ queueId, toUserId }),
        {
          $set: {
            status,
            ...(extras ?? {}),
          },
        },
        { returnDocument: 'after' },
      )
      .exec() as Promise<IInvitation | null>;
  }

  async findById(id: string): Promise<InvitationDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return super.findById(id as any);
  }
}

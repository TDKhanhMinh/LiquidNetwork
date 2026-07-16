import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../../../shared/database/repositories/base.repository';
import { IInvitationQueueRepository } from '../../../domain/repositories/invitation-queue.repository.interface';
import { IInvitationQueue } from '../../../domain/entities/invitation-queue.entity';
import { QueueStatus } from '../../../domain/enums/queue-status.enum';
import {
  InvitationQueue,
  InvitationQueueDocument,
} from '../schemas/invitation-queue.schema';

@Injectable()
export class InvitationQueueMongooseRepository
  extends BaseRepository<InvitationQueueDocument>
  implements IInvitationQueueRepository
{
  constructor(
    @InjectModel(InvitationQueue.name)
    model: Model<InvitationQueueDocument>,
  ) {
    super(model);
  }

  async findActiveByHostId(hostId: string): Promise<IInvitationQueue | null> {
    return this.model
      .findOne(
        this.enrichFilter({
          hostId,
          status: QueueStatus.ACTIVE,
        }),
      )
      .exec() as Promise<IInvitationQueue | null>;
  }

  async replaceActiveState(
    queueId: string,
    expectedGeneration: number,
    next: Partial<IInvitationQueue>,
  ): Promise<IInvitationQueue | null> {
    const filter: Record<string, unknown> = {
      status: QueueStatus.ACTIVE,
      generation: expectedGeneration,
      isDeleted: { $ne: true },
    };
    if (Types.ObjectId.isValid(queueId)) {
      filter._id = new Types.ObjectId(queueId);
    } else {
      filter._id = queueId;
    }

    const { generation: _g, hostId: _h, ...rest } = next as any;
    return this.model
      .findOneAndUpdate(
        filter,
        {
          $set: {
            ...rest,
            ...(next.generation !== undefined
              ? { generation: next.generation }
              : {}),
          },
        },
        { new: true },
      )
      .exec() as Promise<IInvitationQueue | null>;
  }

  async replaceActiveByHost(
    queueId: string,
    hostId: string,
    next: Partial<IInvitationQueue>,
  ): Promise<IInvitationQueue | null> {
    const filter: Record<string, unknown> = {
      hostId,
      status: QueueStatus.ACTIVE,
      isDeleted: { $ne: true },
    };
    if (Types.ObjectId.isValid(queueId)) {
      filter._id = new Types.ObjectId(queueId);
    } else {
      filter._id = queueId;
    }

    return this.model
      .findOneAndUpdate(filter, { $set: next }, { new: true })
      .exec() as Promise<IInvitationQueue | null>;
  }
}

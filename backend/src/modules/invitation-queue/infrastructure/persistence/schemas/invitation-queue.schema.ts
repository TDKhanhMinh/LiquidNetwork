import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QueueStatus } from '../../../domain/enums/queue-status.enum';
import { ParticipantStatus } from '../../../domain/enums/participant-status.enum';
import {
  IInvitationQueue,
} from '../../../domain/entities/invitation-queue.entity';
import { IQueueParticipant } from '../../../domain/entities/queue-participant.entity';

@Schema({ _id: false })
export class QueueParticipant implements IQueueParticipant {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String })
  alcoholToleranceLevel?: string;

  @Prop({ type: String })
  occupation?: string;

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({
    type: String,
    enum: Object.values(ParticipantStatus),
    required: true,
  })
  status: ParticipantStatus;

  @Prop({ type: Date, default: null })
  invitedAt?: Date | null;

  @Prop({ type: Date, default: null })
  respondedAt?: Date | null;
}

const QueueParticipantSchema = SchemaFactory.createForClass(QueueParticipant);

export type InvitationQueueDocument = InvitationQueue & Document;

@Schema({ timestamps: true, collection: 'invitation_queues' })
export class InvitationQueue implements IInvitationQueue {
  @Prop({ type: String, required: true, index: true })
  hostId: string;

  @Prop({ type: String, required: true })
  hostName: string;

  @Prop({ type: String })
  hostAvatar?: string;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String, default: '' })
  message?: string;

  @Prop({
    type: String,
    enum: Object.values(QueueStatus),
    required: true,
    index: true,
  })
  status: QueueStatus;

  @Prop({ type: Number, required: true })
  timeoutSeconds: number;

  @Prop({ type: Number, required: true, default: 0 })
  currentIndex: number;

  @Prop({ type: [QueueParticipantSchema], default: [] })
  participants: QueueParticipant[];

  @Prop({ type: Date, default: null })
  expiresAt?: Date | null;

  @Prop({ type: Number, required: true, default: 0 })
  generation: number;

  @Prop({ type: String, default: null })
  sessionId?: string | null;

  @Prop({ type: Date, default: null })
  completedAt?: Date | null;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const InvitationQueueSchema =
  SchemaFactory.createForClass(InvitationQueue);

// At most one active queue per host (partial unique index)
InvitationQueueSchema.index(
  { hostId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: QueueStatus.ACTIVE,
      isDeleted: { $ne: true },
    },
  },
);

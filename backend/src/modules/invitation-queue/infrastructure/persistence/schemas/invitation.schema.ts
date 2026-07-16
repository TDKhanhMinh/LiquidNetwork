import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InvitationStatus } from '../../../domain/enums/invitation-status.enum';
import { IInvitation } from '../../../domain/entities/invitation.entity';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true, collection: 'invitations' })
export class Invitation implements IInvitation {
  @Prop({ type: String, required: true, index: true })
  queueId: string;

  @Prop({ type: String, required: true, index: true })
  fromUserId: string;

  @Prop({ type: String, required: true })
  fromUserName: string;

  @Prop({ type: String })
  fromUserAvatar?: string;

  @Prop({ type: String, required: true, index: true })
  toUserId: string;

  @Prop({ type: String, required: true })
  toUserName: string;

  @Prop({ type: String })
  toUserAvatar?: string;

  @Prop({
    type: String,
    enum: Object.values(InvitationStatus),
    required: true,
    index: true,
  })
  status: InvitationStatus;

  @Prop({ type: String, default: '' })
  message?: string;

  @Prop({ type: Number, required: true })
  timeoutSeconds: number;

  @Prop({ type: Date, default: null })
  expiresAt?: Date | null;

  @Prop({ type: Date, default: null })
  respondedAt?: Date | null;

  @Prop({ type: Number, required: true })
  participantOrder: number;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

InvitationSchema.index({ queueId: 1, toUserId: 1 });

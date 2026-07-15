import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';
import { IDrunkProfile, IPrivacySettings, IUser } from '../../domain/interfaces/user.interface';

@Schema({ _id: false })
export class DrunkProfile implements IDrunkProfile {
  @Prop({ type: String })
  occupation?: string;

  @Prop({ type: String })
  education?: string;

  @Prop({ type: String })
  selfIntroduction?: string;
}

const DrunkProfileSchema = SchemaFactory.createForClass(DrunkProfile);

@Schema({ _id: false })
export class PrivacySettings implements IPrivacySettings {
  @Prop({ type: Boolean, default: false })
  hideProfile: boolean;

  @Prop({ type: Boolean, default: false })
  hideLevel: boolean;
}

const PrivacySettingsSchema = SchemaFactory.createForClass(PrivacySettings);

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User implements IUser {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  bio?: string;

  @Prop({ type: DrunkProfileSchema, default: {} })
  drunkProfile: DrunkProfile;

  @Prop({
    type: String,
    enum: Object.values(AlcoholToleranceLevel),
    default: AlcoholToleranceLevel.LEVEL_1,
  })
  alcoholToleranceLevel: AlcoholToleranceLevel;

  @Prop({ type: PrivacySettingsSchema, default: () => ({ hideProfile: false, hideLevel: false }) })
  privacySettings: PrivacySettings;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: Number, default: 0 })
  sessionsJoined: number;

  @Prop({ type: Number, default: 0 })
  invitationAcceptRate: number;

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  totalReviews: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

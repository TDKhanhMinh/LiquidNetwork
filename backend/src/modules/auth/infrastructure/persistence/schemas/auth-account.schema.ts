import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IAuthAccount } from '../../../domain/entities/auth-account.entity';

export type AuthAccountDocument = AuthAccount & Document;

@Schema({ timestamps: true, collection: 'auth_accounts' })
export class AuthAccount implements IAuthAccount {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: String })
  googleId?: string;
}

export const AuthAccountSchema = SchemaFactory.createForClass(AuthAccount);

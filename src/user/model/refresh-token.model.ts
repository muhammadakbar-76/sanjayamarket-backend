import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document } from 'mongoose';
import { User } from './user.model';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop()
  is_revoked: boolean;

  @Prop({ type: SchemaTypes.Date })
  expires: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

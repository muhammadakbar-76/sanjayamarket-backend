import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ExcludeProperty } from 'nestjs-mongoose-exclude';

export type UserDocument = User & Document;

export enum Role {
  User = 'user',
  Admin = 'Admin',
}

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  @ExcludeProperty()
  password: string;

  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  city: string;

  @Prop({ default: Role.User, enum: Role })
  role: string;

  @Prop({ default: '/images/null.png' })
  photoPath: string;

  @Prop()
  @ExcludeProperty()
  salt: string;

  @Prop()
  houseNumber: number;

  @Prop({ default: '' })
  fcmToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (user.password) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);

        user.salt = salt;
        user.password = hash;
        next();
      });
    });
  }
});

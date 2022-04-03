import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Food } from '../../food/model/food.model';
import { User } from '../../user/model/user.model';

export type RatingDocument = Rating & Document;

@Schema()
export class Rating {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: Food.name })
  food: Food;

  @Prop()
  rate: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

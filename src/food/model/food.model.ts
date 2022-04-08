import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FoodDocument = Food & Document;

@Schema()
export class Food {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  ingredients: string[];

  @Prop()
  price: number;

  @Prop()
  rate: number;

  @Prop()
  types: FoodType;

  @Prop({ default: '' })
  picturePath: string;

  @Prop({ default: 0 })
  rateCount: number;

  @Prop({ default: 0 })
  orderCount: number;

  @Prop({ default: new Date().toLocaleDateString() })
  date: string;
}

export const FoodSchema = SchemaFactory.createForClass(Food);

export enum FoodType {
  Junk = 'Junk Food',
  Vegetable = 'Vegetable',
  Cuisine = 'Cuisine',
  Fruit = 'Fruit',
}

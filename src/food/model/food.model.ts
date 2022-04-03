import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate } from 'class-validator';
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

  @Prop()
  picturePath?: string;

  @Prop()
  rateCount: number;

  @Prop()
  orderCount: number;

  @IsDate()
  @Prop()
  date: string;
}

export const FoodSchema = SchemaFactory.createForClass(Food);

export enum FoodType {
  Junk = 'Junk Food',
  Vegetable = 'Vegetable',
  Cuisine = 'Cuisine',
  Fruit = 'Fruit',
}

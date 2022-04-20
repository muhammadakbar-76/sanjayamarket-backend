import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from '../../user/model/user.model';
import { FoodDataTransaction } from './food-data.transaction';

export type TransactionDocument = Transaction & Document;

export enum Status {
  Bayar = 'Belum Bayar',
  Lunas = 'Lunas',
  Cooking = 'Cooking',
  Deliver = 'Delivering',
  Cancel = 'Canceled',
  Finish = 'Finished',
}

@Schema()
export class Transaction {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop()
  food: FoodDataTransaction;

  @Prop({ default: new Date().toLocaleDateString() })
  date: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

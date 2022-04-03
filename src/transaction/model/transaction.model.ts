import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Food } from '../../food/model/food.model';
import { User } from '../../user/model/user.model';

export type TransactionDocument = Transaction & Document;

export enum Status {
  Bayar = 'Belum Bayar',
  Deliver = 'Delivering',
  Lunas = 'Lunas',
  Cancel = 'Canceled',
}

@Schema()
export class Transaction {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: Food.name }] })
  food: Food[];

  @Prop()
  quantity: number[];

  @Prop()
  total: number;

  @Prop({ default: Status.Bayar })
  status: Status;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

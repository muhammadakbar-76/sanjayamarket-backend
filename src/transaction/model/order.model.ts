import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document } from 'mongoose';
import { Transaction } from './transaction.model';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: Transaction.name }] })
  transactions: Transaction[];

  @Prop({ default: true })
  isOnProgress: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './model/transaction.model';
import { UserModule } from '../user/user.module';
import { FoodModule } from '../food/food.module';
import { Order, OrderSchema } from './model/order.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
    UserModule,
    FoodModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Transaction, TransactionDocument } from './model/transaction.model';
import { Model } from 'mongoose';
import { EditOrderDto } from './dto/edit-order.dto';
import { SaveTransactionDto } from './dto/save-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionRepo: Model<TransactionDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  async order(transaction: SaveTransactionDto, id: string) {
    try {
      transaction.user = id;
      await this.transactionRepo.create(transaction);
      return 'Transaction Success';
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  getOrderByUserId(id: string) {
    try {
      return this.transactionRepo.find({ user: id }).populate('food');
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  getOrder(body: EditOrderDto, id: string) {
    try {
      return this.transactionRepo.findOne({
        _id: body.orderId,
        user: id,
      });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async cancelOrder(body: EditOrderDto, id: string) {
    try {
      await this.transactionRepo.updateOne(
        {
          _id: body.orderId,
          user: id,
        },
        { status: 'Canceled' },
      );
      return 'Your order successfully canceled';
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

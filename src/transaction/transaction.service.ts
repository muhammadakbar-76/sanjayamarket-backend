import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Transaction, TransactionDocument } from './model/transaction.model';
import { Model } from 'mongoose';
import { EditOrderDto } from './dto/edit-order.dto';
import { SaveTransactionDto } from './dto/save-transaction.dto';
import { Order, OrderDocument } from './model/order.model';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionRepo: Model<TransactionDocument>,
    @InjectModel(Order.name)
    private readonly orderRepo: Model<OrderDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  addTransaction(transaction: SaveTransactionDto) {
    try {
      return this.transactionRepo.create(transaction);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  deleteById(id: string) {
    try {
      return this.transactionRepo.findByIdAndDelete(id);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  updateTransaction(id: string, transaction: SaveTransactionDto) {
    console.log(transaction);
    try {
      return this.transactionRepo.findByIdAndUpdate(id, transaction);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  getAllTransaction() {
    try {
      return this.transactionRepo.find().populate('user', 'id email');
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  getTransactionByUserId(id: string) {
    try {
      return this.transactionRepo.find({ user: id }).populate('food');
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  getTransaction(body: EditOrderDto, id: string) {
    try {
      return this.transactionRepo.findOne({
        _id: body.orderId,
        user: id,
        'food._id': body.foodId,
      });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  getTransactionById(id: string) {
    try {
      return this.transactionRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async cancelTransaction(body: EditOrderDto, id: string) {
    try {
      await this.transactionRepo.updateOne(
        {
          _id: body.orderId,
          user: id,
          'food._id': body.foodId,
        },
        { 'food.status': 'Canceled' },
      );
      return 'Your order successfully canceled';
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  addOrder(transactions: string[]) {
    try {
      return this.orderRepo.create({ transactions });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  updateOrder(id: string, transactions: any[]) {
    try {
      return this.orderRepo.findByIdAndUpdate(id, { transactions });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

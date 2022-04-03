import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Transaction, TransactionDocument } from './model/transaction.model';
import { Model } from 'mongoose';
import { AddTransactionDto } from './dto/add-transaction.dto';
import { UserService } from '../user/user.service';
import { EditOrderDto } from './dto/edit-order.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionRepo: Model<TransactionDocument>,
    @InjectSentry() private readonly client: SentryService,
    private readonly userRepo: UserService,
  ) {}

  async order(transaction: AddTransactionDto) {
    try {
      const user = await this.userRepo.checkId(transaction.user);
      if (user == null) return null;
      await this.transactionRepo.create(transaction);
      return 'Transaction Success';
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async getOrderByUserId(id: string) {
    try {
      return await this.transactionRepo.find({ user: id }).populate('food');
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async getOrder(body: EditOrderDto) {
    try {
      return await this.transactionRepo.findOne({
        _id: body.orderId,
        user: body.userId,
      });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async cancelOrder(body: EditOrderDto) {
    try {
      await this.transactionRepo.updateOne(
        {
          _id: body.orderId,
          user: body.userId,
        },
        { status: 'Canceled' },
      );
      return 'Your order successfully canceled';
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

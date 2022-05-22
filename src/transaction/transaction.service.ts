import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Transaction, TransactionDocument } from './model/transaction.model';
import { Model } from 'mongoose';
import { EditTransactionParamDto } from './dto/edit-transaction-params.dto';
import { SaveTransactionDto } from './dto/save-transaction.dto';
import { Order, OrderDocument } from './model/order.model';
import * as admin from 'firebase-admin';

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
      throw error;
    }
  }

  getAllOrders() {
    try {
      return this.orderRepo.find().populate('transactions');
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getAllOrdersOnProgress() {
    try {
      return this.orderRepo
        .find({ isOnProgress: true })
        .populate({ path: 'transactions', populate: 'user' });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  deleteById(id: string) {
    try {
      return this.transactionRepo.findByIdAndDelete(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  deleteOrderById(id: string) {
    try {
      return this.orderRepo.findByIdAndDelete(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  updateTransaction(id: string, transaction: SaveTransactionDto) {
    try {
      return this.transactionRepo.findByIdAndUpdate(id, transaction);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getAllTransaction(isForPayment = false) {
    try {
      return this.transactionRepo
        .find({ ...(isForPayment ? { 'food.status': 'Belum_Bayar' } : {}) })
        .populate('user');
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getTransactionByUserId(id: string) {
    try {
      return this.transactionRepo.find({
        user: id,
      });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getTransactionByOrderId(id: string) {
    try {
      return this.transactionRepo.find({ orderId: id });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getTransaction(body: EditTransactionParamDto, id: string) {
    try {
      return this.transactionRepo.findOne({
        _id: body.transactionId,
        user: id,
        'food._id': body.foodId,
      });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  updateTransactionStatus(id: string, status: string) {
    try {
      return this.transactionRepo.findByIdAndUpdate(id, {
        'food.status': status,
      });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getTransactionById(id: string) {
    try {
      return this.transactionRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  async cancelTransaction(body: EditTransactionParamDto, id: string) {
    try {
      await this.transactionRepo.updateOne(
        {
          _id: body.transactionId,
          user: id,
          'food._id': body.foodId,
        },
        { 'food.status': 'Canceled' },
      );
      return 'Your transaction successfully canceled';
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  addOrder(transactions: string[]) {
    try {
      return this.orderRepo.create({ transactions });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getOrderById(id: string, isForDeleting = false) {
    try {
      if (isForDeleting) return this.orderRepo.findById(id);
      return this.orderRepo
        .findById(id)
        .populate({ path: 'transactions', populate: 'user' });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  updateOrder(id: string, transactions: any[]) {
    try {
      return this.orderRepo.findByIdAndUpdate(id, { transactions });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  changeOrderProgress(id: string, progress: boolean) {
    try {
      return this.orderRepo.findByIdAndUpdate(id, { isOnProgress: progress });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  sendNotification(fcmToken: string, payload: { body: string; title: string }) {
    try {
      return admin.messaging().sendToDevice(fcmToken, {
        notification: {
          body: payload.body,
          title: payload.title,
        },
      });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }
}

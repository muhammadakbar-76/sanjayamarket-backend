import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Transaction, TransactionDocument } from './model/transaction.model';
import { Model } from 'mongoose';
import { EditTransactionParamDto } from './dto/edit-transaction-params.dto';
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
    return this.transactionRepo.create(transaction);
  }

  getAllOrders() {
    return this.orderRepo.find().populate('transactions');
  }

  getAllOrdersOnProgress() {
    return this.orderRepo
      .find({ isOnProgress: true })
      .populate({ path: 'transactions', populate: 'user' });
  }

  deleteById(id: string) {
    return this.transactionRepo.findByIdAndDelete(id);
  }

  deleteOrderById(id: string) {
    return this.orderRepo.findByIdAndDelete(id);
  }

  updateTransaction(id: string, transaction: SaveTransactionDto) {
    return this.transactionRepo.findByIdAndUpdate(id, transaction);
  }

  getAllTransaction(isForPayment = false) {
    return this.transactionRepo
      .find({ ...(isForPayment ? { 'food.status': 'Belum_Bayar' } : {}) })
      .populate('user');
  }

  getTransactionByUserId(id: string) {
    return this.transactionRepo.find({
      user: id,
    });
  }

  getTransaction(body: EditTransactionParamDto, id: string) {
    return this.transactionRepo.findOne({
      _id: body.transactionId,
      user: id,
      'food._id': body.foodId,
    });
  }

  updateTransactionStatus(id: string, status: string) {
    return this.transactionRepo.findByIdAndUpdate(id, {
      'food.status': status,
    });
  }

  getTransactionById(id: string) {
    return this.transactionRepo.findById(id);
  }

  async cancelTransaction(body: EditTransactionParamDto, id: string) {
    await this.transactionRepo.updateOne(
      {
        _id: body.transactionId,
        user: id,
        'food._id': body.foodId,
      },
      { 'food.status': 'Canceled' },
    );
    return 'Your transaction successfully canceled';
  }

  addOrder(transactions: string[]) {
    return this.orderRepo.create({ transactions });
  }

  getOrderById(id: string) {
    return this.orderRepo
      .findById(id)
      .populate({ path: 'transactions', populate: 'user' });
  }

  updateOrder(id: string, transactions: any[]) {
    return this.orderRepo.findByIdAndUpdate(id, { transactions });
  }

  changeOrderProgress(id: string, progress: boolean) {
    return this.orderRepo.findByIdAndUpdate(id, { isOnProgress: progress });
  }

  sendError(e: any) {
    this.client.instance().captureException(e);
  }
}

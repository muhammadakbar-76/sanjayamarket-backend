import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Put,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { OrderParams } from './dto/order-param.dto';
import { Status } from './model/transaction.model';
import { TransactionService } from './transaction.service';
import { FoodService } from '../food/food.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { EditTransactionDto } from './dto/edit-transaction.dto';

@Controller('transaction')
@UseGuards(AuthenticatedGuard)
@UseFilters(new HttpExceptionFilter('/auth/login'))
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
    private readonly foodService: FoodService,
  ) {}

  @Get()
  @Render('transaction/index')
  async showOrderPage(@Req() req: Request) {
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Transactions',
      message,
      success,
    };
  }

  @Get('get-all')
  async getAllTransactions(@Res() res: Response) {
    const transactions = await this.transactionService.getAllTransaction();
    return res.status(200).json(transactions);
  }

  @Get('edit/:id')
  @Render('transaction/edit_transaction')
  @UseFilters(new HttpExceptionFilter('/transaction'))
  async editTransactionPage(
    @Req() req: Request,
    @Param() transactionParam: OrderParams,
  ) {
    const transaction = await this.transactionService.getTransactionById(
      transactionParam.id,
    );
    if (transaction === null)
      throw new HttpException('Transaction not found', 404);
    const orderStatus = Object.values(Status);
    const users = await this.userService.getAllForTransaction();
    const foods = await this.foodService.getAllForTransaction();
    return {
      layout: 'templates/main_layout',
      title: 'Edit Transaction',
      transaction,
      orderStatus,
      users,
      foods,
    };
  }

  @Put(':id')
  @UseFilters(new HttpExceptionFilter('/transaction'))
  async editTransaction(
    @Req() req: Request,
    @Res() res: Response,
    @Param() transactionParam: OrderParams,
    @Body() body: EditTransactionDto,
  ) {
    const data = await Promise.all([
      this.transactionService.getTransactionById(transactionParam.id),
      this.foodService.getById(body.food),
    ]);
    if (data[0] === null || data[1] === null)
      throw new HttpException('Order/Food not found', 404);
    await this.transactionService.updateTransaction(transactionParam.id, {
      orderId: data[0].orderId,
      user: body.user,
      food: {
        _id: data[1]._id.toString(),
        name: data[1].name,
        price: data[1].price,
        imageUrl: data[1].picturePath,
        quantity: body.quantity,
        status: body.status,
      },
      ...(body.date !== ''
        ? { date: new Date(body.date).toLocaleDateString() }
        : {}),
    });
    req.flash('success', 'Transaction has been successfully updated');
    res.redirect('/transaction');
  }

  @Get('/detail/:id')
  @UseFilters(new HttpExceptionFilter('/transaction'))
  @Render('transaction/detail_page')
  async getTransactionDetailPage(@Param() transactionParam: OrderParams) {
    const transaction = await this.transactionService.getTransactionById(
      transactionParam.id,
    );
    if (transaction === null)
      throw new HttpException('Transaction not found', 404);
    const user = await this.userService.checkId(transaction.user.toString());
    return {
      layout: 'templates/main_layout',
      title: 'Transaction Detail',
      transaction,
      email: user.email,
    };
  }

  @Get('orders')
  @UseFilters(new HttpExceptionFilter('transaction/orders'))
  @Render('transaction/orders')
  async getAllOrders(@Req() req: Request) {
    const transactions = await this.transactionService.getAllTransaction();
    const belumBayar = transactions.filter(
      (el) => el.food.status === 'Belum_Bayar',
    );
    const cooking = transactions.filter((el) => el.food.status === 'Cooking');
    const deliver = transactions.filter(
      (el) => el.food.status === 'Delivering',
    );
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Orders On Progress',
      message,
      success,
      belumBayar,
      cooking,
      deliver,
    };
  }

  @Delete(':id')
  @UseFilters(new HttpExceptionFilter('/transaction'))
  async deleteTransaction(
    @Param() transactionParam: OrderParams,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const transaction = await this.transactionService.getTransactionById(
      transactionParam.id,
    );
    if (transaction === null)
      throw new HttpException('Transaction not found', 404);
    await this.transactionService.deleteById(transactionParam.id);
    req.flash('success', 'Transaction deleted successfully');
    return res.redirect('/transaction');
  }
}

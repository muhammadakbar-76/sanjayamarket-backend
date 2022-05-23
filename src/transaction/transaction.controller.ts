import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { HttpExceptionFilter } from '../utilities/filters/http-exception.filter';
import { OrderParams } from './dto/order-param.dto';
import { Status } from './model/transaction.model';
import { TransactionService } from './transaction.service';
import { FoodService } from '../food/food.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { EditTransactionDto } from './dto/edit-transaction.dto';
import { StatusQueryDto } from './dto/status-query.dto';

const firebasePayload = {
  [Status.Bayar]: 'You need to pay!',
  [Status.Cancel]: 'Your order has been canceled by ud',
  [Status.Cooking]: 'Your order has been accepted',
  [Status.Deliver]: 'Our courier will deliver your order',
  [Status.Finish]: 'Thank you for your order, enjoy the food!',
};

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
  async showTransactionsPage(@Req() req: Request & any) {
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Transactions',
      message,
      success,
      csrfToken: req.csrfToken(),
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
    @Req() req: Request & any,
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
      csrfToken: req.csrfToken(),
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
    const result = await Promise.all([
      this.transactionService.updateTransaction(transactionParam.id, {
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
      }),
      this.transactionService.getOrderById(data[0].orderId),
      ...(body.status === Status.Cancel
        ? [
            this.foodService.updateFoodOrder(
              data[1].orderCount - body.quantity,
              body.food,
            ),
          ]
        : data[0].food.quantity !== body.quantity
        ? [
            this.foodService.updateFoodOrder(
              data[1].orderCount - data[0].food.quantity + body.quantity,
              body.food,
            ),
          ]
        : []),
    ]);
    const isOnProgress = result[1].transactions.filter(
      (transaction) =>
        transaction.food.status !== Status.Cancel &&
        transaction.food.status !== Status.Finish,
    );
    if (isOnProgress.length === 0) {
      await this.transactionService.changeOrderProgress(result[1].id, false);
    }
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

  @Get('order/detail/:id')
  @UseFilters(new HttpExceptionFilter('/transaction/orders'))
  @Render('transaction/order_detail_page')
  async getOrderDetailPage(@Param() orderParam: OrderParams) {
    const order = await this.transactionService.getOrderById(orderParam.id);
    if (order === null) throw new HttpException('Order not found', 404);
    return {
      layout: 'templates/main_layout',
      title: 'Order Details',
      order,
    };
  }

  @Get('orders')
  @Render('transaction/orders')
  async showOrdersPage(@Req() req: Request & any) {
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Orders',
      message,
      success,
      csrfToken: req.csrfToken(),
    };
  }

  @Get('orders/get-all')
  async getAllOrders(@Res() res: Response) {
    const orders = await this.transactionService.getAllOrders();
    return res.status(200).json(orders);
  }

  @Get('orders-on-progress')
  @UseFilters(new HttpExceptionFilter('/transaction/orders-on-progress'))
  @Render('transaction/orders_on_progress')
  async showOnProgressOrderPage(@Req() req: Request & any) {
    const message = req.flash('message');
    const success = req.flash('success');
    const data = await Promise.all([
      this.transactionService.getAllOrdersOnProgress(),
      this.transactionService.getAllTransaction(true),
    ]);
    const setOfUsers = new Set(data[1].map((el) => el.user));
    const payments = Array.from(setOfUsers).map((user) => {
      const payment = data[1]
        .filter((el) => el.user.email === user.email)
        .reduce(
          (sum, current) => sum + current.food.price * current.food.quantity,
          0,
        );
      return {
        user,
        payment: payment + payment * 0.1 + 10000,
      };
    });
    return {
      layout: 'templates/main_layout',
      title: 'On Progress Orders',
      message,
      success,
      orders: data[0],
      payments,
      status: Object.values(Status),
      csrfToken: req.csrfToken(),
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
    const data = await Promise.all([
      this.transactionService.getOrderById(transaction.orderId, true),
      this.foodService.getById(transaction.food._id),
    ]);
    const newTransactionList = data[0].transactions.filter(
      (trans) => trans.toString() !== transaction.id,
    );
    const result = await Promise.all([
      this.transactionService.updateOrder(data[0].id, newTransactionList),
      this.transactionService.deleteById(transactionParam.id),
      this.foodService.updateFoodOrder(
        data[1].orderCount - transaction.food.quantity,
        data[1].id,
      ),
    ]);
    if (result[0].transactions.length === 1) {
      await this.transactionService.deleteOrderById(data[0].id);
    }
    req.flash('success', 'Transaction deleted successfully');
    return res.redirect('/transaction');
  }

  @Delete('order/:id')
  @UseFilters(new HttpExceptionFilter('/transaction/orders'))
  async deleteOrder(
    @Param() orderParam: OrderParams,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const data = await Promise.all([
      this.transactionService.getOrderById(orderParam.id, true),
      this.transactionService.getTransactionByOrderId(orderParam.id),
    ]);
    if (data[0] === null || data[1].length === 0)
      throw new HttpException('Order/transactions not found', 404);
    await Promise.all([
      ...data[0].transactions.map((id) => {
        const res = this.transactionService.deleteById(id.toString());
        return res;
      }),
      this.transactionService.deleteOrderById(orderParam.id),
    ]);
    const foods = await Promise.all(
      data[1].map((val) => {
        const food = this.foodService.getById(val.food._id);
        return food;
      }),
    );
    await Promise.all(
      foods.map((food, i) => {
        const del = this.foodService.updateFoodOrder(
          food.orderCount - data[1][i].food.quantity,
          food.id,
        );
        return del;
      }),
    );
    req.flash('success', 'Order deleted successfully');
    return res.redirect('/transaction/orders');
  }

  @Put('order/:id')
  @UseFilters(new HttpExceptionFilter('/transaction/orders-on-progress'))
  async changeStatusTransaction(
    @Param() statusParam: OrderParams,
    @Query() query: StatusQueryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const transaction = await this.transactionService.getTransactionById(
      statusParam.id,
    );
    if (transaction === null)
      throw new HttpException('Transaction Not Found', 404);
    const data = await Promise.all([
      this.transactionService.updateTransactionStatus(
        statusParam.id,
        query.status,
      ),
      this.transactionService.getOrderById(transaction.orderId),
    ]);
    const isFinished = data[1].transactions.filter(
      (transaction) =>
        transaction.food.status !== Status.Cancel &&
        transaction.food.status !== Status.Finish,
    );

    if (isFinished.length === 0)
      await this.transactionService.changeOrderProgress(
        transaction.orderId,
        false,
      );
    req.flash('success', 'Status changed successfully');
    return res.redirect('/transaction/orders-on-progress');
  }

  @Put('order/all/:id')
  @UseFilters(new HttpExceptionFilter('/transaction/orders-on-progress'))
  async changeAllStatusTransaction(
    @Param() statusParam: OrderParams,
    @Query() query: StatusQueryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const order = await Promise.all([
      this.transactionService.getOrderById(statusParam.id, true),
      this.transactionService.getOrderById(statusParam.id),
    ]);
    if (order === null) throw new HttpException('Order Not Found', 404);
    await Promise.all([
      ...order[0].transactions.map((transaction) => {
        const result = this.transactionService.updateTransactionStatus(
          transaction.toString(),
          query.status,
        );
        return result;
      }),
      this.transactionService.sendNotification(
        order[1].transactions[0].user.fcmToken,
        {
          body: firebasePayload[query.status],
          title: query.status,
        },
      ),
    ]);
    const isFinished = order[1].transactions.filter(
      (transaction) =>
        transaction.food.status !== Status.Cancel &&
        transaction.food.status !== Status.Finish,
    );

    if (isFinished.length === 0)
      await this.transactionService.changeOrderProgress(statusParam.id, false);
    req.flash('success', 'All status changed successfully');
    return res.redirect('/transaction/orders-on-progress');
  }

  @Post('notify/:id')
  @UseFilters(new HttpExceptionFilter('/transaction/orders-on-progress'))
  async sendNotif(
    @Param() orderParam: OrderParams,
    @Query() query: StatusQueryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const order = await this.transactionService.getOrderById(orderParam.id);
    if (order === null)
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    await this.transactionService.sendNotification(
      order.transactions[0].user.fcmToken,
      {
        body: firebasePayload[query.status],
        title: query.status,
      },
    );
    req.flash('success', 'User has been notified!');
    return res.redirect('/transaction/orders-on-progress');
  }
}

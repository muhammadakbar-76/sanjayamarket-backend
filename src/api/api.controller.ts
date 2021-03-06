import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FoodService } from '../food/food.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from '../user/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/jwt-guard';
import { Public } from '../utilities/decorator/public.decorator';
import { AddTransactionDto } from '../transaction/dto/add-transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { EditUserDto } from '../user/dto/edit-user.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateRatingDto } from '../rating/dto/create-rating.dto';
import { RatingService } from '../rating/rating.service';
import { EditTransactionParamDto } from '../transaction/dto/edit-transaction-params.dto';
import { UserDocument } from '../user/model/user.model';
import { RefreshRequestDto } from '../user/dto/refresh-request.dto';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import { extname } from 'path';
import { Status } from '../transaction/model/transaction.model';
import { ApiService } from './api.service';
import { CheckEmailDto } from '../user/dto/check-email.dto';
import { AuthenticationPayload, payloadJWT } from './api.interfaces';
import { Cache } from 'cache-manager';
import { ApiQueryDto, SendEmailDto } from './api.dto';

@UseInterceptors(new SanitizeMongooseModelInterceptor())
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class ApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly foodService: FoodService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    private readonly ratingService: RatingService,
    private readonly apiService: ApiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private buildResponsePayload(
    user: UserDocument,
    accessToken: string,
    refreshToken?: string,
  ): AuthenticationPayload {
    return {
      user,
      payload: {
        type: 'bearer',
        token: accessToken,
        telegram_key: process.env.TELEGRAM_BOT_KEY,
        chat_id: process.env.CHAT_ID_TELEGRAM,
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      },
    };
  }

  @Get('foods')
  async getAllFood(@Res() res: Response) {
    try {
      const foods = await this.foodService.getAll();
      return res.status(200).json(foods);
    } catch (error) {
      throw error;
    }
  }

  @Post('register')
  @Public()
  @UseInterceptors(
    FileInterceptor('photoPath', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(24).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new HttpException(
              'Only image files are allowed!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async registerNewUser(
    @Body() user: CreateUserDto,
    @Query() query: ApiQueryDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const isLegit = await this.cacheManager.get(query.pre);
      if (isLegit === undefined)
        throw new HttpException('Token Not Exist', HttpStatus.FORBIDDEN);
      if (Number(query.code) !== Number(isLegit)) {
        throw new HttpException(
          'Verification Code Wrong',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.cacheManager.reset();
      if (file !== undefined) {
        user.photoPath = `/images/${file.filename}`;
      }
      const isEmailRegistered = await this.userService.checkEmail(user.email);
      if (isEmailRegistered !== null)
        throw new HttpException(
          'Email already been registered',
          HttpStatus.BAD_REQUEST,
        );
      const newUser = await this.userService.register(user);
      const token = this.authService.createToken(newUser);
      const refresh = await this.authService.generateRefreshToken(
        newUser,
        60 * 60 * 24 * 30,
      );
      const payload = this.buildResponsePayload(newUser, token, refresh);
      return res.status(201).json({
        status: 'success',
        data: payload,
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @Public()
  @UseGuards(ThrottlerGuard) // throttle will cause error when test
  async login(@Body() credential: LoginDto, @Res() res: Response) {
    try {
      const user = await this.userService.login(credential);
      if (
        user == null ||
        !bcrypt.compareSync(credential.password, user.password)
      )
        throw new HttpException(
          'email or password is wrong',
          HttpStatus.BAD_REQUEST,
        );

      const token = this.authService.createToken(user);
      const refresh = await this.authService.generateRefreshToken(
        user,
        60 * 60 * 24 * 30,
      );

      const payload = this.buildResponsePayload(user, token, refresh);

      return res.status(200).json({
        status: 'success',
        data: payload,
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh')
  @Public()
  public async refresh(@Body() body: RefreshRequestDto, @Res() res: Response) {
    try {
      const { user, token } =
        await this.authService.createAccessTokenFromRefreshToken(
          body.refresh_token,
        );

      const payload = this.buildResponsePayload(user, token);

      return res.status(200).json({
        status: 'success',
        data: payload,
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('transaction')
  async addTransaction(
    @Body() body: AddTransactionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const payload = req.user as payloadJWT;
      const foodsList = await Promise.all(
        body.food.map((id) => {
          const food = this.foodService.getById(id);
          if (food == null)
            throw new HttpException(
              "Food does'nt exist",
              HttpStatus.BAD_REQUEST,
            );
          return food;
        }),
      );
      const order = await this.transactionService.addOrder([]);
      const transactions = await Promise.all(
        foodsList.map((fl, i) => {
          const transaction = this.transactionService.addTransaction({
            orderId: order.id,
            user: payload.id,
            food: {
              _id: fl.id,
              name: fl.name,
              imageUrl: fl.picturePath,
              price: fl.price,
              status: Status.Bayar,
              quantity: body.quantity[i],
            },
          });
          return transaction;
        }),
      );
      const listOfTransactionsId = transactions.map((el) => el.id);
      const total = transactions.reduce(
        (sum, current) => sum + current.food.price * current.food.quantity,
        0,
      );
      const message = foodsList
        .map(
          (fl, i) =>
            ` - ${fl.name} sebanyak ${body.quantity[i]} dengan transactionId: ${transactions[i].id}\n`,
        )
        .join('\n');
      //this one experimental
      this.apiService.sendMessage(
        payload.email,
        payload.id,
        message,
        total,
        order.id,
      );
      await Promise.all([
        this.transactionService.updateOrder(order.id, listOfTransactionsId),
        ...foodsList.map((el, i) => {
          const updateFood = this.foodService.updateFoodOrder(
            el.orderCount + body.quantity[i],
            el.id,
          );
          return updateFood;
        }),
      ]);
      return res.status(201).json('transaction success');
    } catch (error) {
      throw error;
    }
  }

  @Get('transactions')
  async getTransactionByUserId(@Req() req: Request, @Res() res: Response) {
    try {
      const payload = req.user as payloadJWT;
      const userTransactions =
        await this.transactionService.getTransactionByUserId(payload.id);
      if (userTransactions.length === 0)
        throw new HttpException(
          'User or Transaction Not Found',
          HttpStatus.NOT_FOUND,
        );
      const total = userTransactions
        .filter((val) => val.food.status === Status.Bayar)
        .reduce(
          (sum, current) => sum + current.food.price * current.food.quantity,
          0,
        );
      return res.status(200).json({
        payments: total + total * 0.1 + (total <= 0 ? 0 : 10000),
        transactions: userTransactions,
      });
    } catch (error) {
      throw error;
    }
  }

  @Put('transaction')
  async cancelTransaction(
    @Body() body: EditTransactionParamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const payload = req.user as payloadJWT;
      const data = await Promise.all([
        this.transactionService.getTransaction(body, payload.id),
        this.foodService.getById(body.foodId),
      ]);
      if (data[0] === null)
        throw new HttpException(
          'User or Order not found',
          HttpStatus.NOT_FOUND,
        );
      if (data[0].food.status !== 'Belum_Bayar')
        throw new HttpException(
          "Food already been paid/cooked/delivered/canceled, sorry you can't cancel this order",
          HttpStatus.BAD_REQUEST,
        );
      const result = await Promise.all([
        this.foodService.updateFoodOrder(
          data[1].orderCount - data[0].food.quantity,
          body.foodId,
        ),
        this.transactionService.getOrderById(data[0].orderId),
        this.transactionService.cancelTransaction(body, payload.id),
      ]);
      const isOnProgress = result[1].transactions.filter(
        (transaction) =>
          transaction.food.status !== Status.Cancel &&
          transaction.food.status !== Status.Finish,
      );
      if (isOnProgress.length === 0) {
        await this.transactionService.changeOrderProgress(
          data[0].orderId,
          false,
        );
      }
      return res.status(200).json(result[2]);
    } catch (error) {
      throw error;
    }
  }

  @Post('rate')
  async setRate(
    @Body() body: CreateRatingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const payload = req.user as payloadJWT;
      const data = await Promise.all([
        this.userService.checkId(payload.id),
        this.foodService.getById(body.food),
        this.ratingService.checkRating(body, payload.id),
      ]);
      if (data[0] == null)
        throw new HttpException(
          "You already rated this food or user doesn't exist",
          HttpStatus.BAD_REQUEST,
        );
      if (data[1] == null)
        throw new HttpException("food doesn't exist", HttpStatus.BAD_REQUEST);
      if (data[2])
        throw new HttpException(
          "You already rated this food or user doesn't exist",
          HttpStatus.BAD_REQUEST,
        );
      const newRate =
        (data[1].rate * data[1].rateCount + body.rate) /
        (data[1].rateCount + 1);
      const result = await Promise.all([
        this.foodService.updateFoodRate(
          {
            rate: Number(newRate.toFixed(1)),
            rateCount: data[1].rateCount + 1,
          },
          body.food,
        ),
        this.ratingService.addRate(body, payload.id),
      ]);
      return res.status(201).json(result[1]);
    } catch (error) {
      throw error;
    }
  }

  @Put('user')
  async editUser(
    @Body() body: EditUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const payload = req.user as payloadJWT;
      const user = await Promise.all([
        this.userService.checkId(payload.id),
        this.userService.checkEmail(body.email),
      ]);
      if (user[0].email !== user[1].email)
        if (user[1].email !== null)
          throw new HttpException(
            'Email already been registered',
            HttpStatus.BAD_REQUEST,
          );
      if (user[0] == null || user[0].role !== 'user')
        throw new HttpException(
          'User Not Existed or Old Password Wrong',
          HttpStatus.BAD_REQUEST,
        );
      if (body.oldPassword !== null) {
        if (!bcrypt.compareSync(body.oldPassword, user[0].password))
          throw new HttpException(
            'User Not Existed or Old Password Wrong',
            HttpStatus.BAD_REQUEST,
          );
      }

      await this.userService.editUser(payload.id, body);
      return res.status(200).json('Your profile updated successfully');
    } catch (error) {
      throw error;
    }
  }

  @Post('check-email')
  @UseGuards(ThrottlerGuard)
  @Public()
  async checkEmail(@Body() body: CheckEmailDto, @Res() res: Response) {
    try {
      const data = await this.userService.checkEmail(body.email);
      if (data !== null)
        return res.status(200).json({ isEmailExist: true, pre: '' });
      const key = crypto.randomBytes(16).toString('hex');
      const value = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      await this.cacheManager.set<number>(key, value, { ttl: 150 });
      return res.status(200).json({ isEmailExist: false, pre: key });
    } catch (error) {
      throw error;
    }
  }

  @Post('send-code')
  @UseGuards(ThrottlerGuard)
  @Public()
  async sendVerifCode(@Body() body: SendEmailDto, @Res() res: Response) {
    try {
      const isLegit = await this.cacheManager.get<number>(body.pre);
      if (isLegit == undefined)
        throw new HttpException(
          'Token expired, please register again.',
          HttpStatus.FORBIDDEN,
        );
      const key = crypto.randomBytes(16).toString('hex');
      const value = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      await Promise.all([
        this.cacheManager.del(body.pre),
        this.cacheManager.set(key, value, { ttl: 1800 }),
        this.apiService.sendEmail(body.name, body.email, value),
      ]);
      //! Lakukan operasi pengiriman email
      return res.status(200).json({ pre: key });
    } catch (error) {
      throw error;
    }
  }
}

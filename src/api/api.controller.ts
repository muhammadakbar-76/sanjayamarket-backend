import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Put,
  Req,
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
import { Public } from '../decorator/public.decorator';
import { AddTransactionDto } from '../transaction/dto/add-transaction.dto';
import { TransactionService } from '../transaction/transaction.service';
import { EditUserDto } from '../user/dto/edit-user.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateRatingDto } from '../rating/dto/create-rating.dto';
import { RatingService } from '../rating/rating.service';
import { EditOrderDto } from '../transaction/dto/edit-order.dto';
import { User, UserDocument } from '../user/model/user.model';
import { RefreshRequestDto } from '../user/dto/refresh-request.dto';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import { extname, join } from 'path';

export interface AuthenticationPayload {
  user: User;
  payload: {
    type: string;
    token: string;
    refresh_token?: string;
  };
}

interface payloadJWT {
  name: string;
  email: string;
  id: string;
}

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
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      },
    };
  }

  @Get('foods')
  async getAllFood() {
    const foods = await this.foodService.getAll();
    return JSON.parse(JSON.stringify(foods));
  }

  @Post('register')
  @Public()
  @UseInterceptors(
    FileInterceptor('photoPath', {
      storage: diskStorage({
        destination: join(__dirname, '../..', 'public/images'),
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(24).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new HttpException('Only image files are allowed!', 400),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async registerNewUser(
    @Body() user: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file !== undefined) {
      user.photoPath = `/images/${file.filename}`;
    }
    const isEmailRegistered = await this.userService.checkEmail(user.email);
    if (isEmailRegistered !== null)
      throw new HttpException('Email already been registered', 400);
    const newUser = await this.userService.register(user);
    const token = this.authService.createToken(newUser);
    const refresh = await this.authService.generateRefreshToken(
      newUser,
      60 * 60 * 24 * 30,
    );
    const payload = this.buildResponsePayload(newUser, token, refresh);
    return {
      status: 'success',
      data: payload,
    };
  }

  @Post('login')
  @Public()
  @UseGuards(ThrottlerGuard)
  async login(@Body() credential: LoginDto) {
    const user = await this.userService.login(credential);
    if (user == null)
      throw new HttpException('email or password is wrong', 400);
    if (!bcrypt.compareSync(credential.password, user.password))
      throw new HttpException('email or password is wrong', 400);

    const token = this.authService.createToken(user);
    const refresh = await this.authService.generateRefreshToken(
      user,
      60 * 60 * 24 * 30,
    );

    const payload = this.buildResponsePayload(user, token, refresh);

    return {
      status: 'success',
      data: payload,
    };
  }

  @Post('refresh')
  @Public()
  public async refresh(@Body() body: RefreshRequestDto) {
    const { user, token } =
      await this.authService.createAccessTokenFromRefreshToken(
        body.refresh_token,
      );

    const payload = this.buildResponsePayload(user, token);

    return {
      status: 'success',
      data: payload,
    };
  }

  @Post('order')
  async addTransaction(@Body() body: AddTransactionDto, @Req() req: Request) {
    const payload = req.user as payloadJWT;
    const foodsList = await Promise.all(
      body.food.map((id) => {
        const food = this.foodService.getFoodOrderCount(id);
        if (food == null) throw new HttpException("Food does'nt exist", 400);
        return food;
      }),
    );
    await Promise.all(
      foodsList.map((fl, i) => {
        const data = this.foodService.updateFoodOrder(
          fl.orderCount + body.quantity[i],
          fl.id,
        );
        return data;
      }),
    );
    const transaction = await this.transactionService.order(body, payload.id);
    return transaction;
  }

  @Get('order')
  async getOrderByUserId(@Req() req: Request) {
    const payload = req.user as payloadJWT;
    const userOrders = await this.transactionService.getOrderByUserId(
      payload.id,
    );
    if (userOrders.length === 0)
      throw new HttpException('User or Order Not Found', 404);
    return JSON.parse(JSON.stringify(userOrders));
  }

  @Put('order')
  async cancelOrder(@Body() body: EditOrderDto, @Req() req: Request) {
    const payload = req.user as payloadJWT;
    const order = await this.transactionService.getOrder(body, payload.id);
    if (order === null) throw new HttpException('User or Order not found', 404);
    if (order.status !== 'Belum Bayar')
      throw new HttpException(
        "Food already been delivered/paid, sorry you can't cancel this order",
        400,
      );
    return await this.transactionService.cancelOrder(body, payload.id);
  }

  @Post('rate')
  async setRate(@Body() body: CreateRatingDto, @Req() req: Request) {
    const payload = req.user as payloadJWT;
    const isUserExisted = await this.userService.checkId(payload.id);
    if (isUserExisted == null)
      throw new HttpException(
        "You already rated this food or user doesn't exist",
        400,
      );
    const food = await this.foodService.getById(body.food);
    if (food == null) throw new HttpException("food doesn't exist", 400);
    const isAlreadyRated = await this.ratingService.checkRating(
      body,
      payload.id,
    );
    if (isAlreadyRated)
      throw new HttpException(
        "You already rated this food or user doesn't exist",
        400,
      );
    const newRate =
      (food.rate * food.rateCount + body.rate) / (food.rateCount + 1);
    await this.foodService.updateFoodRate(
      {
        rate: Number(newRate.toFixed(1)),
        rateCount: food.rateCount + 1,
      },
      body.food,
    );
    return await this.ratingService.addRate(body, payload.id);
  }

  @Put('user')
  async editUser(@Body() body: EditUserDto, @Req() req: Request) {
    const payload = req.user as payloadJWT;
    const user = await this.userService.checkId(payload.id);
    if (user == null)
      throw new HttpException('User Not Existed or Old Password Wrong', 400);
    if (body.oldPassword !== null) {
      if (!bcrypt.compareSync(body.oldPassword, user.password))
        throw new HttpException('User Not Existed or Old Password Wrong', 400);
    }
    await this.userService.editUser(payload.id, body);
    return 'Your profile updated successfully';
  }
}

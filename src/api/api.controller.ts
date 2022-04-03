import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
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
import { UserParamDto } from '../user/dto/user-param.dto';
import { EditUserDto } from '../user/dto/edit-user.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateRatingDto } from '../rating/dto/create-rating.dto';
import { RatingService } from '../rating/rating.service';
import { EditOrderDto } from '../transaction/dto/edit-order.dto';
import { User, UserDocument } from '../user/model/user.model';
import { RefreshRequestDto } from '../user/dto/refresh-request.dto';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { AuthService } from '../auth/auth.service';

export interface AuthenticationPayload {
  user: User;
  payload: {
    type: string;
    token: string;
    refresh_token?: string;
  };
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

  @Get('food')
  async getAllFood() {
    return await this.foodService.getAll();
  }

  @Post('register')
  @Public()
  async registerNewUser(@Body() user: CreateUserDto) {
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
  async addTransaction(@Body() body: AddTransactionDto) {
    const transaction = await this.transactionService.order(body);
    if (transaction == null) throw new HttpException('UserId not found', 400);
    return transaction;
  }

  @Get('order/:id')
  async getOrderByUserId(@Param() userParam: UserParamDto) {
    const userOrders = await this.transactionService.getOrderByUserId(
      userParam.id,
    );
    if (userOrders.length === 0) throw new HttpException('User Not Found', 404);
    return userOrders;
  }

  @Put('order')
  async cancelOrder(@Body() body: EditOrderDto) {
    const order = await this.transactionService.getOrder(body);
    if (order === null) throw new HttpException('User or Order not found', 404);
    if (order.status === 'Delivering')
      throw new HttpException(
        "Food already been delivered, sorry you can't cancel this order",
        400,
      );
    return await this.transactionService.cancelOrder(body);
  }

  @Post('rate')
  async setRate(@Body() body: CreateRatingDto) {
    const isUserExisted = await this.userService.checkId(body.user);
    if (isUserExisted == null)
      throw new HttpException(
        "You already rated this food or user doesn't exist",
        400,
      );
    const isAlreadyRated = await this.ratingService.checkRating(body);
    if (isAlreadyRated)
      throw new HttpException(
        "You already rated this food or user doesn't exist",
        400,
      );
    return await this.ratingService.addRate(body);
  }

  @Put('user/:id')
  async editUser(@Param() userParam: UserParamDto, @Body() body: EditUserDto) {
    const user = await this.userService.checkId(userParam.id);
    if (user == null)
      throw new HttpException('User Not Existed or Old Password Wrong', 400);
    if (!bcrypt.compareSync(body.oldPassword, user.password))
      throw new HttpException('User Not Existed or Old Password Wrong', 400);
    await this.userService.editUser(userParam.id, body);
    return 'Your profile updated successfully';
  }
}

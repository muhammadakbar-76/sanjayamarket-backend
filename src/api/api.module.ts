import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { FoodModule } from '../food/food.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { RatingModule } from '../rating/rating.module';
import { AuthModule } from '../auth/auth.module';
import { ApiService } from './api.service';
import { TelegramModule } from 'nestjs-telegram';

@Module({
  imports: [
    FoodModule,
    TransactionModule,
    UserModule,
    RatingModule,
    AuthModule,
    TelegramModule.forRoot({
      botKey: process.env.TELEGRAM_BOT_KEY,
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}

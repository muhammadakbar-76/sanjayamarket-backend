import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { FoodModule } from '../food/food.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { RatingModule } from '../rating/rating.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    FoodModule,
    TransactionModule,
    UserModule,
    RatingModule,
    AuthModule,
  ],
  controllers: [ApiController],
})
export class ApiModule {}

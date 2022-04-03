import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
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
  providers: [ApiService],
})
export class ApiModule {}

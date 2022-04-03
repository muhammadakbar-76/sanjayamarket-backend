import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { FoodModule } from '../food/food.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-strategy';
import { ConfigModule } from '@nestjs/config';
import { RatingModule } from '../rating/rating.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
    }),
    FoodModule,
    TransactionModule,
    UserModule,
    RatingModule,
  ],
  controllers: [ApiController],
  providers: [ApiService, JwtStrategy],
})
export class ApiModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { FoodModule } from './food/food.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './api/api.module';
import { RatingModule } from './rating/rating.module';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      environment: 'dev',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    UserModule,
    FoodModule,
    TransactionModule,
    ApiModule,
    RatingModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

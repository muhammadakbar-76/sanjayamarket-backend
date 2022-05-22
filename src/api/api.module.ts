import { CacheModule, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { FoodModule } from '../food/food.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { RatingModule } from '../rating/rating.module';
import { AuthModule } from '../auth/auth.module';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    FoodModule,
    TransactionModule,
    UserModule,
    RatingModule,
    AuthModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    CacheModule.register(),
    MailerModule.forRoot({
      transport: process.env.SMTP_TRANSPORT_STRING,
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(
    @InjectSentry() private readonly client: SentryService,
    private readonly httpService: HttpService,
  ) {}

  sendMessage(
    email: string,
    id: string,
    message: string,
    total: number,
    orderId: string,
  ) {
    try {
      return lastValueFrom(
        this.httpService.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_KEY}/sendMessage`,
          {
            chat_id: process.env.CHAT_ID_TELEGRAM,
            text: `Order ID: ${orderId}\n\nUser ${id} dengan email ${email} telah memesan :\n\n${message}\n\nTotal Tagihan : ${total}`,
          },
        ),
      );
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }
}

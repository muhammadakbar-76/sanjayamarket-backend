import { Injectable } from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { TelegramService } from 'nestjs-telegram';

@Injectable()
export class ApiService {
  constructor(
    @InjectSentry() private readonly client: SentryService,
    private readonly telegramService: TelegramService,
  ) {}

  sendMessage(
    email: string,
    id: string,
    message: string,
    total: number,
    orderId: string,
  ) {
    try {
      return this.telegramService
        .sendMessage({
          chat_id: process.env.CHAT_ID_TELEGRAM,
          text: `Order ID: ${orderId}\n\nUser ${id} dengan email ${email} telah memesan :\n\n${message}\n\nTotal Tagihan : ${total}`,
        })
        .toPromise();
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class ApiService {
  constructor(@InjectSentry() private readonly client: SentryService) {}

  sendMessage(email: string, id: string, message: string, total: number) {
    try {
      const sid = process.env.TWILIO_SID;
      const token = process.env.TWILIO_TOKEN;
      const client = twilio(sid, token);
      return client.messages.create({
        from: 'whatsapp:+14155238886',
        body: `User ${id} dengan email ${email} telah memesan :\n${message}\nTotal Tagihan : ${total}`,
        to: 'whatsapp:+6282251857550',
      });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  sendMessageStatus(status: any) {
    try {
      this.client.instance().captureMessage(JSON.stringify(status));
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class ApiService {
  constructor(@InjectSentry() private readonly client: SentryService) {}

  sendMessage(email: string, id: string, message: string) {
    try {
      const sid = process.env.TWILIO_SID;
      const token = process.env.TWILIO_TOKEN;
      const client = twilio(sid, token);
      return client.messages.create({
        from: 'whatsapp:+14155238886',
        body: `User ${id} dengan email ${email} telah memesan :\n${message}`,
        to: 'whatsapp:+6282251857550',
      });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

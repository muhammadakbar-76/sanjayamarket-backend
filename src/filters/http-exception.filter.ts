import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private url: string) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('its catched');
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let response;
    const status = exception.getStatus();
    if (status === 404) {
      response = {
        message: [exception.getResponse()],
      };
    } else {
      response = exception.getResponse() as {
        statusCode: number;
        message: string[];
      };
    }
    req.flash('message', response.message);
    console.log('it here in exception');
    res.redirect(this.url);
  }
}

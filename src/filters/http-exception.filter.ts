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
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let response;
    const status = exception.getStatus();
    if (typeof exception.getResponse() === 'string') {
      response = {
        statusCode: status,
        message: [exception.getResponse()],
      };
    } else {
      response = exception.getResponse() as {
        statusCode: number;
        message: string[];
      };
    }
    req.flash('message', response.message);
    res.redirect(this.url);
  }
}

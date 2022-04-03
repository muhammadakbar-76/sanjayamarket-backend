import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    // const status = exception.getStatus();
    const response = exception.getResponse() as {
      statusCode: number;
      message: string[];
    };

    req.flash('message', [...response.message]);
    res.redirect('/employee');
  }
}

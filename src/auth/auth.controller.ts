import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @UseGuards(LocalAuthGuard)
  @UseFilters(new HttpExceptionFilter('/auth/login'))
  @Post('login')
  login(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('login')
  @Render('login_page')
  loginPage(@Req() req: Request & any) {
    const message = req.flash('message');
    if (message.length > 0) message.push('Wrong Credentials');
    return {
      title: 'Login',
      layout: 'templates/blank_layout',
      message,
      csrfToken: req.csrfToken(),
    };
  }
}

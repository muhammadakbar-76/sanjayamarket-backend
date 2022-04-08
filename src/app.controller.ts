import { Controller, Get, Render, UseFilters, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from './auth/authenticated.guard';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@UseGuards(AuthenticatedGuard)
@UseFilters(new HttpExceptionFilter('/auth/login'))
@Controller()
export class AppController {
  @Get()
  @Render('home.ejs')
  home() {
    return {
      layout: 'templates/main_layout.ejs',
      title: 'Dashboard',
    };
  }
}

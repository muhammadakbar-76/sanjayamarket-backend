import {
  Controller,
  Get,
  Render,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { UserService } from './user.service';
import { Request } from 'express';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { Role } from './model/user.model';

@Controller('user')
@UseGuards(AuthenticatedGuard)
@UseFilters(new HttpExceptionFilter('/auth/login'))
@UseInterceptors(new SanitizeMongooseModelInterceptor())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Render('users/index')
  async usersPage(@Req() req: Request) {
    const users = await this.userService.getAll();
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Users',
      message,
      users,
      success,
    };
  }

  @Get('add')
  @Render('users/add_user')
  async addUserPage(@Req() req: Request) {
    const message = req.flash('message');
    const userRoles = Object.values(Role);
    return {
      layout: 'templates/main_layout',
      title: 'Add User',
      message,
      userRoles,
    };
  }
}

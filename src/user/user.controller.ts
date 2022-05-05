import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Render,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { Role } from './model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import { extname } from 'path';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UserParamDto } from './dto/user-param.dto';
import * as fs from 'fs';

@Controller('user')
@UseGuards(AuthenticatedGuard)
@UseFilters(new HttpExceptionFilter('/auth/login'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Render('users/index')
  async usersPage(@Req() req: Request) {
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Users',
      message,
      success,
    };
  }

  @Get('get-all')
  async getAllUser(@Res() res: Response) {
    try {
      const user = await this.userService.getAll();
      return res.status(200).json(user);
    } catch (error) {
      this.userService.sendError(error);
    }
  }

  @Post()
  @UseFilters(new HttpExceptionFilter('/user/add'))
  @UseInterceptors(
    FileInterceptor('photoPath', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(24).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new HttpException('Only image files are allowed!', 400),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async addFood(
    @Body() user: CreateUserAdminDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const isEmailExist = await this.userService.checkEmail(user.email);
      if (isEmailExist != null)
        throw new HttpException('Email already have been used', 400);
      if (file != null) {
        user.photoPath = `/images/${file.filename}`;
      }
      await this.userService.register(user);
      req.flash('success', 'New User Successfully Added');
      res.redirect('/user');
    } catch (error) {
      this.userService.sendError(error);
    }
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

  @Get('edit/:id')
  @Render('users/edit_user')
  @UseFilters(new HttpExceptionFilter('/user'))
  async getEditUserPage(@Req() req: Request, @Param() userParam: UserParamDto) {
    try {
      const userRoles = Object.values(Role);
      const user = await this.userService.checkId(userParam.id);
      if (user === null) throw new HttpException('User not found', 404);
      return {
        layout: 'templates/main_layout',
        title: 'Edit User',
        user,
        userRoles,
      };
    } catch (error) {
      this.userService.sendError(error);
    }
  }

  @Delete(':id')
  async deleteUser(
    @Param() userParam: UserParamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.checkId(userParam.id);
      if (user.photoPath !== '/images/null.png') {
        fs.unlinkSync(`./public${user.photoPath}`);
      }
      await this.userService.deleteById(userParam.id);
      req.flash('success', 'User has been deleted successfully');
      res.redirect('/user');
    } catch (error) {
      this.userService.sendError(error);
    }
  }
}

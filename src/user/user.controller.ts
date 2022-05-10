import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
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
import * as bcrypt from 'bcrypt';
import { extname } from 'path';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UserParamDto } from './dto/user-param.dto';
import * as fs from 'fs';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('user')
@UseGuards(AuthenticatedGuard)
@UseFilters(new HttpExceptionFilter('/auth/login'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Render('users/index')
  async usersPage(@Req() req: Request & any) {
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Users',
      message,
      success,
      csrfToken: req.csrfToken(),
    };
  }

  @Put('edit/:id')
  @UseFilters(new HttpExceptionFilter('/user'))
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
  async editUser(
    @Param() userParam: UserParamDto,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: EditUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.userService.checkId(userParam.id);
    if (
      user == null ||
      !bcrypt.compareSync(body.oldPassword, user.password) ||
      user.role !== 'Admin'
    )
      throw new HttpException(
        "User doesn't exist | Password wrong | You don't have previlege",
        404,
      );
    if (file != null) {
      body.photoPath = `/images/${file.filename}`;
      fs.unlinkSync(`./public${user.photoPath}`);
    }
    await this.userService.editUser(userParam.id, body);
    req.flash('success', 'User Successfully Edited');
    res.redirect('/user');
  }

  @Get('get-all')
  async getAllUser(@Res() res: Response) {
    const user = await this.userService.getAll();
    return res.status(200).json(user);
  }

  @Post('add')
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
  async addUser(
    @Body() user: CreateUserAdminDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const isEmailExist = await this.userService.checkEmail(user.email);
    if (isEmailExist != null) {
      console.log('yes email exist');
      throw new HttpException('Email already have been used', 400);
    }
    if (file != null) user.photoPath = `/images/${file.filename}`;
    await this.userService.register(user);
    req.flash('success', 'New User Successfully Added');
    res.redirect('/user');
  }

  @Get('add')
  @Render('users/add_user')
  async addUserPage(@Req() req: Request & any) {
    const message = req.flash('message');
    const userRoles = Object.values(Role);
    return {
      layout: 'templates/main_layout',
      title: 'Add User',
      message,
      userRoles,
      csrfToken: req.csrfToken(),
    };
  }

  @Get('edit/:id')
  @Render('users/edit_user')
  @UseFilters(new HttpExceptionFilter('/user'))
  async getEditUserPage(
    @Req() req: Request & any,
    @Param() userParam: UserParamDto,
  ) {
    const userRoles = Object.values(Role);
    const user = await this.userService.checkId(userParam.id);
    if (user === null) throw new HttpException('User not found', 404);
    return {
      layout: 'templates/main_layout',
      title: 'Edit User',
      user,
      userRoles,
      csrfToken: req.csrfToken(),
    };
  }

  @Delete(':id')
  async deleteUser(
    @Param() userParam: UserParamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.userService.checkId(userParam.id);
    if (user.photoPath !== '/images/null.png') {
      fs.unlinkSync(`./public${user.photoPath}`);
    }
    await this.userService.deleteById(userParam.id);
    req.flash('success', 'User has been deleted successfully');
    res.redirect('/user');
  }
}

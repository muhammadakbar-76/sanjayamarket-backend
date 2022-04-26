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
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { FoodParams } from './dto/food-param.dto';
import { FoodService } from './food.service';
import { Food, FoodType } from './model/food.model';
import * as crypto from 'crypto';
import { extname } from 'path';
import { CreateFoodDto } from './dto/create-food.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { EditFoodDto } from './dto/edit-food.dto';
import * as fs from 'fs';

@UseGuards(AuthenticatedGuard)
@UseFilters(new HttpExceptionFilter('/auth/login'))
@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  async showPageFood(@Req() req: Request, @Res() res: Response) {
    const message = req.flash('message');
    const success = req.flash('success');
    res.render('foods/index', {
      title: 'Foods',
      layout: 'templates/main_layout',
      message,
      success,
    });
  }

  @Get('get-all')
  async getAllFood(@Res() res: Response) {
    const foods = await this.foodService.getAll();
    return res.status(200).json(foods);
  }

  @Get('edit/:id')
  @UseFilters(new HttpExceptionFilter('/food'))
  async editFoodPage(
    @Req() req: Request,
    @Param() foodParam: FoodParams,
    @Res() res: Response,
  ) {
    const food = await this.foodService.getById(foodParam.id);
    if (!food) throw new HttpException("Food doesn't Exist", 404);
    const foodTypes = Object.values(FoodType);
    res.render('foods/edit_food', {
      title: 'Foods',
      layout: 'templates/main_layout',
      food,
      foodTypes,
    });
  }

  @Get('add')
  @Render('foods/add_food')
  addFoodPage(@Req() req: Request) {
    const message = req.flash('message');
    const foodTypes = Object.values(FoodType);
    return {
      title: 'Add New Food',
      layout: 'templates/main_layout',
      message,
      foodTypes,
    };
  }

  @Post('add')
  @UseFilters(new HttpExceptionFilter('/food/add'))
  @UseInterceptors(
    FileInterceptor('picturePath', {
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
    @Body() food: CreateFoodDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const removedSpacesIngredients = food.ingredients.replace(/\s*,\s*/g, ',');
    const ingredientsArray = removedSpacesIngredients.split(',');
    const newFood = new Food();
    if (file != null) {
      newFood.picturePath = `/images/${file.filename}`;
    }
    Object.keys(FoodType).forEach((e) => {
      if (FoodType[e] === food.types) newFood.types = FoodType[e];
    });
    newFood.name = food.name;
    newFood.description = food.description;
    newFood.ingredients = ingredientsArray;
    newFood.price = food.price;
    await this.foodService.addFood(newFood);
    req.flash('success', 'New Food Successfully Added');
    res.redirect('/food');
  }

  @Put('edit/:id')
  @UseFilters(new HttpExceptionFilter('/food'))
  @UseInterceptors(
    FileInterceptor('picturePath', {
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
  async editFood(
    @Param() foodParam: FoodParams,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: EditFoodDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const food = await this.foodService.getById(foodParam.id);
    if (food == null) throw new HttpException("Food doesn't exist", 404);
    const removedSpacesIngredients = body.ingredients.replace(/\s*,\s*/g, ',');
    const ingredientsArray = removedSpacesIngredients.split(',');
    const editedFood = new Food();
    if (file != null) {
      editedFood.picturePath = `/images/${file.filename}`;
      if (food.picturePath !== '/images/null.png') {
        fs.unlinkSync(`./public${food.picturePath}`);
      }
    }
    Object.keys(FoodType).forEach((e) => {
      if (FoodType[e] === body.types) editedFood.types = FoodType[e];
    });
    editedFood.name = body.name;
    editedFood.description = body.description;
    editedFood.ingredients = ingredientsArray;
    editedFood.price = body.price;
    await this.foodService.updateFood(foodParam.id, editedFood);
    req.flash('success', 'Food Successfully Edited');
    res.redirect('/food');
  }

  @Delete(':id')
  @UseFilters(new HttpExceptionFilter('/food'))
  async deleteFood(
    @Param() foodParam: FoodParams,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const food = await this.foodService.getById(foodParam.id);
    if (food == null) throw new HttpException('Food not found', 404);
    await this.foodService.deleteFood(foodParam.id);
    req.flash('success', 'Food deleted successfully');
    res.redirect('/food');
  }
}

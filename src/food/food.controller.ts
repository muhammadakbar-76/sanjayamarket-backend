import {
  Controller,
  Get,
  HttpException,
  Param,
  Render,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { FoodParams } from './dto/food-param.dto';
import { FoodService } from './food.service';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  @Render('foods')
  async showAllFood(@Req() req: Request) {
    const foods = await this.foodService.getAll();
    const message = req.flash('message');
    const success = req.flash('success');
    return {
      layout: 'templates/main_layout',
      title: 'Foods',
      foods,
      message,
      success,
    };
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
    const message = req.flash('message');
    res.render('edit_food', {
      title: 'Foods',
      layout: 'templates/main_layout',
      food,
      message,
    });
  }
}

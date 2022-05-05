import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Food, FoodDocument } from './model/food.model';
import { Model } from 'mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { EditFoodRatingDto } from './dto/edit-food-rating.dto';

@Injectable()
export class FoodService {
  constructor(
    @InjectModel(Food.name) private foodRepo: Model<FoodDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  getAll() {
    return this.foodRepo.find();
  }

  getAllForTransaction() {
    return this.foodRepo.find().select('id name price');
  }

  getById(id: string) {
    return this.foodRepo.findById(id);
  }

  addFood(newFood: Food) {
    return this.foodRepo.create(newFood);
  }

  async updateFood(id: string, food: Food) {
    const FoodData = await this.foodRepo.findById(id);
    if (FoodData == null) return null;

    return this.foodRepo.findByIdAndUpdate(id, food);
  }

  deleteFood(id: string) {
    return this.foodRepo.findByIdAndRemove(id);
  }

  updateFoodOrder(newOrderCount: number, foodId: string) {
    return this.foodRepo.findByIdAndUpdate(foodId, {
      orderCount: newOrderCount,
    });
  }

  updateFoodRate(foodWithNewRate: EditFoodRatingDto, foodId: string) {
    return this.foodRepo.findByIdAndUpdate(foodId, foodWithNewRate);
  }

  sendError(e: any) {
    this.client.instance().captureException(e);
  }
}

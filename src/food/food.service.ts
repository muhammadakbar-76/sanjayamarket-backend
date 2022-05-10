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
    try {
      return this.foodRepo.find();
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getAllForTransaction() {
    try {
      return this.foodRepo.find().select('id name price');
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getById(id: string) {
    try {
      return this.foodRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  addFood(newFood: Food) {
    try {
      return this.foodRepo.create(newFood);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  async updateFood(id: string, food: Food) {
    try {
      const FoodData = await this.foodRepo.findById(id);
      if (FoodData == null) return null;

      return this.foodRepo.findByIdAndUpdate(id, food);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  deleteFood(id: string) {
    try {
      return this.foodRepo.findByIdAndRemove(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  updateFoodOrder(newOrderCount: number, foodId: string) {
    try {
      return this.foodRepo.findByIdAndUpdate(foodId, {
        orderCount: newOrderCount,
      });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  updateFoodRate(foodWithNewRate: EditFoodRatingDto, foodId: string) {
    try {
      return this.foodRepo.findByIdAndUpdate(foodId, foodWithNewRate);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Food, FoodDocument } from './model/food.model';
import { Model } from 'mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class FoodService {
  constructor(
    @InjectModel(Food.name) private foodRepo: Model<FoodDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  async getAll() {
    // at first, i want to select spesific field, but instead of do http req for every detail, lets just call it from cubit
    return await this.foodRepo.find();
  }

  async getById(id: string) {
    return await this.foodRepo.findById(id);
  }

  async addFood(newFood: Food) {
    try {
      return await this.foodRepo.create(newFood);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async updateFood(id: string, food: Food) {
    try {
      const FoodData = await this.foodRepo.findById(id);
      if (FoodData == null) return null;

      return await this.foodRepo.findByIdAndUpdate(id, food);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async deleteFood(id: string) {
    try {
      await this.foodRepo.findByIdAndRemove(id);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

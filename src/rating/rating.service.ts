import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating, RatingDocument } from './model/rating.model';
import { Model } from 'mongoose';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { SaveRatingDto } from './dto/save-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name)
    private readonly ratingRepo: Model<RatingDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  async checkRating(body: CreateRatingDto, userId: string) {
    const isAlreadyRated = await this.ratingRepo.find({
      food: body.food,
      user: userId,
    });
    if (isAlreadyRated.length === 0) return false;
    return true;
  }

  async addRate(body: SaveRatingDto, userId: string) {
    body.user = userId;
    await this.ratingRepo.create(body);
    return 'Thank you for your feedback';
  }

  sendError(e: any) {
    this.client.instance().captureException(e);
  }
}

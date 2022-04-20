import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { CreateFoodDto } from './create-food.dto';

export class EditFoodRatingDto extends PartialType(CreateFoodDto) {
  @IsNumber()
  readonly rate?: number;

  @IsNumber()
  readonly rateCount?: number;
}

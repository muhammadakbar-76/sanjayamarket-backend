import { PartialType } from '@nestjs/mapped-types';
import { IsDecimal, IsMongoId, IsNotEmpty } from 'class-validator';
import { CreateRatingDto } from './create-rating.dto';

export class SaveRatingDto extends PartialType(CreateRatingDto) {
  @IsMongoId()
  user?: string;

  @IsNotEmpty()
  @IsMongoId()
  food: string;

  @IsNotEmpty()
  @IsDecimal()
  rate: number;
}

import { PartialType } from '@nestjs/mapped-types';
import { IsDecimal, IsMongoId, IsNotEmpty } from 'class-validator';
import { CreateRatingDto } from './create-rating.dto';

export class SaveRatingDto extends PartialType(CreateRatingDto) {
  @IsMongoId()
  user?: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly food: string;

  @IsNotEmpty()
  @IsDecimal()
  readonly rate: number;
}

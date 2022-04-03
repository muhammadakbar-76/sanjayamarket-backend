import { IsDecimal, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsMongoId()
  food: string;

  @IsNotEmpty()
  @IsDecimal()
  rate: number;
}

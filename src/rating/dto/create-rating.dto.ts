import { IsMongoId, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsMongoId()
  food: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  rate: number;
}

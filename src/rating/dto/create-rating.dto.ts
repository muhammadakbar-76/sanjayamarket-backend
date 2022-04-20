import { IsMongoId, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly food: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  readonly rate: number;
}

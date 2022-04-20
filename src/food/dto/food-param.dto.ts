import { IsMongoId } from 'class-validator';

export class FoodParams {
  @IsMongoId()
  readonly id: string;
}

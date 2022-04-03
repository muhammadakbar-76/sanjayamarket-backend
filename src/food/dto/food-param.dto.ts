import { IsMongoId } from 'class-validator';

export class FoodParams {
  @IsMongoId()
  id: string;
}

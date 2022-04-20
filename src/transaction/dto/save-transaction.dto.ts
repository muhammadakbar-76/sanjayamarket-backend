import { IsMongoId, IsNotEmpty } from 'class-validator';
import { FoodDataTransaction } from '../model/food-data.transaction';

export class SaveTransactionDto {
  @IsMongoId()
  readonly user: string;

  @IsNotEmpty()
  readonly food: FoodDataTransaction;
}

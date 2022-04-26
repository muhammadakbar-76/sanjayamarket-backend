import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { FoodDataTransaction } from '../model/food-data.transaction';

export class SaveTransactionDto {
  @IsMongoId()
  orderId: string;

  @IsMongoId()
  readonly user: string;

  @IsNotEmpty()
  readonly food: FoodDataTransaction;

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  readonly date?: string;
}

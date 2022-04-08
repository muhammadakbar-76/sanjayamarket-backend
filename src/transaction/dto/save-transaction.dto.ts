import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNumber, IsNotEmpty } from 'class-validator';
import { AddTransactionDto } from './add-transaction.dto';

export class SaveTransactionDto extends PartialType(AddTransactionDto) {
  @IsMongoId()
  user?: string;

  @IsNotEmpty()
  @IsMongoId({ each: true })
  food: string[];

  @IsNotEmpty()
  @IsNumber({}, { each: true })
  quantity: number[];

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

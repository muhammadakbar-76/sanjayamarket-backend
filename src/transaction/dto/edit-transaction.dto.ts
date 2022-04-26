import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../model/transaction.model';

export class EditTransactionDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly user: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly food: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly quantity: number;

  @IsNotEmpty()
  @IsEnum(Status)
  readonly status: string;

  @IsOptional()
  readonly date: string;
}

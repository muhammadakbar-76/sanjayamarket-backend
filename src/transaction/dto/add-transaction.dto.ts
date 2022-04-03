import { IsMongoId, IsNumber, IsNotEmpty } from 'class-validator';

export class AddTransactionDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

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

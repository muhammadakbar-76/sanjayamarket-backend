import { IsMongoId, IsNumber, IsNotEmpty } from 'class-validator';

export class AddTransactionDto {
  @IsNotEmpty()
  @IsMongoId({ each: true })
  readonly food: string[];

  @IsNotEmpty()
  @IsNumber({}, { each: true })
  readonly quantity: number[];
}

import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EditTransactionParamDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly transactionId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly foodId: string;
}

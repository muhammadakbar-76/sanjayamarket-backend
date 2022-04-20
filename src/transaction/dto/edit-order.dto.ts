import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EditOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly orderId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly foodId: string;
}

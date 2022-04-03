import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EditOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  orderId: string;
}

import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EditOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  orderId: string;
}

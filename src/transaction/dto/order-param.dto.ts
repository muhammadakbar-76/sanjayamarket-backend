import { IsMongoId } from 'class-validator';

export class OrderParams {
  @IsMongoId()
  readonly id: string;
}

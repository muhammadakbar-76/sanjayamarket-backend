import { IsEnum } from 'class-validator';
import { Status } from '../model/transaction.model';

export class StatusQueryDto {
  @IsEnum(Status)
  readonly status: string;
}

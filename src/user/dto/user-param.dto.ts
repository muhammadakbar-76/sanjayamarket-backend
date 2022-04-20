import { IsMongoId } from 'class-validator';

export class UserParamDto {
  @IsMongoId()
  readonly id: string;
}

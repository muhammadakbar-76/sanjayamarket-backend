import { IsMongoId } from 'class-validator';

export class UserParamDto {
  @IsMongoId()
  id: string;
}

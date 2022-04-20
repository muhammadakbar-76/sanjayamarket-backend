import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsPhoneNumber, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class SaveUserDto extends PartialType(CreateUserDto) {
  @IsString()
  readonly name?: string;

  @IsString()
  readonly password?: string;

  @IsString()
  readonly adress?: string;

  @IsPhoneNumber('ID')
  readonly phoneNumber?: string;

  @IsString()
  readonly city?: string;

  @IsString()
  readonly photoPath?: string;

  @IsNumber()
  readonly houseNumber?: number;
}

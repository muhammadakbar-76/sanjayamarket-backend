import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsPhoneNumber, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class SaveUserDto extends PartialType(CreateUserDto) {
  @IsString()
  name?: string;

  @IsString()
  password?: string;

  @IsString()
  adress?: string;

  @IsPhoneNumber('ID')
  phoneNumber?: string;

  @IsString()
  city?: string;

  @IsString()
  photoPath?: string;

  @IsNumber()
  houseNumber?: number;
}

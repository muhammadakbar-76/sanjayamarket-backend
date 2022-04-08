import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';
import { CreateUserDto } from './create-user.dto';

export class EditUserDto extends PartialType(CreateUserDto) {
  @IsString()
  name?: string;

  @IsString()
  password?: string;

  @IsString()
  oldPassword?: string;

  @IsString()
  adress?: string;

  @IsPhoneNumber('ID')
  phoneNumber?: string;

  @IsString()
  city?: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(1000000)
  photoPath?: string;

  @IsNumber()
  houseNumber?: number;
}

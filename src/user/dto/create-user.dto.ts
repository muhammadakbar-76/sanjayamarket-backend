import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must at least 6 digit' })
  password: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsPhoneNumber('ID')
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(1000000)
  photoPath?: any;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  houseNumber: number;
}

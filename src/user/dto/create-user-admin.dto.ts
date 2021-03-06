import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';
import { Role } from '../model/user.model';

export class CreateUserAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must at least 6 digit' })
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsNotEmpty()
  @IsPhoneNumber('ID')
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(1000000)
  photoPath?: any;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly houseNumber: number;
}

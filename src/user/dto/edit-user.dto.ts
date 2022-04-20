import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';
import { CreateUserDto } from './create-user.dto';

export class EditUserDto extends PartialType(CreateUserDto) {
  @IsString()
  readonly name?: string;

  @IsString()
  readonly password?: string;

  @IsString()
  readonly oldPassword?: string;

  @IsString()
  readonly adress?: string;

  @IsPhoneNumber('ID')
  readonly phoneNumber?: string;

  @IsString()
  readonly city?: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(1000000)
  readonly photoPath?: string;

  @IsNumber()
  readonly houseNumber?: number;
}

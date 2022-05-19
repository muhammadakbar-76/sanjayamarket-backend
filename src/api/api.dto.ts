import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApiQueryDto {
  @IsNotEmpty()
  @IsString()
  pre: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  code: number;
}

export class SendEmailDto {
  @IsNotEmpty()
  @IsString()
  pre: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

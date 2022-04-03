import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

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
  adress: string;

  @IsNotEmpty()
  @IsPhoneNumber('ID')
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsString()
  photoPath?: string;

  @IsNotEmpty()
  @IsNumber()
  houseNumber: number;
}

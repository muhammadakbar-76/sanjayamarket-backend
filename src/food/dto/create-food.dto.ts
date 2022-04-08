import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';

export class CreateFoodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString({ each: true })
  ingredients: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNumber()
  rate?: number;

  @IsNotEmpty()
  @IsString()
  types: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(100000)
  picturePath?: any;

  @IsNumber()
  rateCount?: number;

  @IsNumber()
  orderCount?: number;
}

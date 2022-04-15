import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';

export class CreateFoodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  ingredients: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsNotEmpty()
  @IsString()
  types: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(100000)
  picturePath?: any;

  @IsOptional()
  @IsNumber()
  rateCount?: number;

  @IsOptional()
  @IsNumber()
  orderCount?: number;
}

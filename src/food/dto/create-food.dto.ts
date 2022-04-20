import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';

export class CreateFoodDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly ingredients: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly price: number;

  @IsOptional()
  @IsFile()
  @MaxFileSize(100000)
  readonly picturePath?: any;

  @IsNotEmpty()
  @IsString()
  readonly types: string;
}

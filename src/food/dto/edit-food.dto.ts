import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';
import { CreateFoodDto } from './create-food.dto';

export class EditFoodDto extends PartialType(CreateFoodDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly ingredients?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly price?: number;

  @IsOptional()
  @IsFile()
  @MaxFileSize(100000)
  readonly picturePath?: any;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly types?: string;
}

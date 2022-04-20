import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize } from 'nestjs-form-data';
import { CreateFoodDto } from './create-food.dto';

export class EditFoodDto extends PartialType(CreateFoodDto) {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsString()
  readonly ingredients?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly price?: number;

  @IsOptional()
  @IsFile()
  @MaxFileSize(100000)
  readonly picturePath?: any;

  @IsOptional()
  @IsString()
  readonly types?: string;
}

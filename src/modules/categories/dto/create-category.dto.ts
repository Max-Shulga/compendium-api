import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';

import {
  MAX_CATEGORY_DESCRIPTION_LENGTH,
  MAX_CATEGORY_NAME_LENGTH
} from '@/common/constants/validation.constants';

import { CategoryItemDto } from './category-item.dto';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CATEGORY_NAME_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CATEGORY_DESCRIPTION_LENGTH)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayUnique((item: CategoryItemDto) => `${item.itemType}:${item.itemId}`)
  @Type(() => CategoryItemDto)
  items?: CategoryItemDto[];
}

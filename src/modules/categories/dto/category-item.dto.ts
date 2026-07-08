import { IsEnum, IsInt, IsPositive } from 'class-validator';

import { CategoryItemType } from '../enums/category-item-type.enum';

export class CategoryItemDto {
  @IsEnum(CategoryItemType)
  itemType!: CategoryItemType;

  @IsInt()
  @IsPositive()
  itemId!: number;
}

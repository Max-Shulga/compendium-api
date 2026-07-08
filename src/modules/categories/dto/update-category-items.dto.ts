import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, ValidateNested } from 'class-validator';

import { CategoryItemDto } from './category-item.dto';

export class UpdateCategoryItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayUnique((item: CategoryItemDto) => `${item.itemType}:${item.itemId}`)
  @Type(() => CategoryItemDto)
  items!: CategoryItemDto[];
}

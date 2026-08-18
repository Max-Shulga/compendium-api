import { IsInt, IsOptional, IsPositive } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class FindInterviewCardsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  topicId?: number;
}

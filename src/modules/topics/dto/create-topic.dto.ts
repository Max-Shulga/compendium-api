import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  MAX_TOPIC_DESCRIPTION_LENGTH,
  MAX_TOPIC_NAME_LENGTH,
} from '@/common/constants/validation.constants';

class TopicCardDto {
  @IsInt()
  @IsPositive()
  cardId!: number;
}

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TOPIC_NAME_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TOPIC_DESCRIPTION_LENGTH)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayUnique((card: TopicCardDto) => card.cardId)
  @Type(() => TopicCardDto)
  cards?: TopicCardDto[];
}

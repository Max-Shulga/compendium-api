import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

class TopicCardDto {
  @IsInt()
  cardId!: number;
}

export class CreateTopicDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicCardDto)
  cards?: TopicCardDto[];
}

import { IsArray, IsInt } from 'class-validator';

export class UpdateTopicCardsDto {
  @IsArray()
  @IsInt({ each: true })
  cardIds!: number[];
}

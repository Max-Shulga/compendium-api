import { ArrayUnique, IsArray, IsInt, IsPositive } from 'class-validator';

export class UpdateTopicCardsDto {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ArrayUnique()
  cardIds!: number[];
}

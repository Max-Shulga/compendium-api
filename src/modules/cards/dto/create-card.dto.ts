import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import {
  MAX_CARD_TEXT_LENGTH,
  MAX_CARD_TITLE_LENGTH,
} from '@/common/constants/validation.constants';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CARD_TITLE_LENGTH)
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CARD_TEXT_LENGTH)
  readonly text!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CARD_TEXT_LENGTH)
  readonly examples?: string;
}

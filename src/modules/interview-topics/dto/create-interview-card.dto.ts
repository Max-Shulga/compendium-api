import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength
} from 'class-validator';

import {
  MAX_INTERVIEW_CARD_TEXT_LENGTH,
  MAX_INTERVIEW_CARD_TITLE_LENGTH
} from '@/common/constants/validation.constants';

export class CreateInterviewCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_INTERVIEW_CARD_TITLE_LENGTH)
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_INTERVIEW_CARD_TEXT_LENGTH)
  readonly text!: string;

  @IsInt()
  @IsPositive()
  readonly topicId!: number;
}

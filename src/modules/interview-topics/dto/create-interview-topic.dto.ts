import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import {
  MAX_INTERVIEW_TOPIC_DESCRIPTION_LENGTH,
  MAX_INTERVIEW_TOPIC_TITLE_LENGTH
} from '@/common/constants/validation.constants';

export class CreateInterviewTopicDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_INTERVIEW_TOPIC_TITLE_LENGTH)
  readonly title!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_INTERVIEW_TOPIC_DESCRIPTION_LENGTH)
  readonly description?: string;
}

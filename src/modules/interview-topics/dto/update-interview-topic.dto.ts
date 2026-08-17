import { PartialType } from '@nestjs/swagger';

import { CreateInterviewTopicDto } from './create-interview-topic.dto';

export class UpdateInterviewTopicDto extends PartialType(
  CreateInterviewTopicDto
) {}

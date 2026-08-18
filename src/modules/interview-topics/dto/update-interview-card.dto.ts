import { PartialType } from '@nestjs/swagger';

import { CreateInterviewCardDto } from './create-interview-card.dto';

export class UpdateInterviewCardDto extends PartialType(
  CreateInterviewCardDto
) {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../iam/authentication/decorators/auth.decorators';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

import { CreateInterviewCardDto } from './dto/create-interview-card.dto';
import { FindInterviewCardsQueryDto } from './dto/find-interview-cards-query.dto';
import { UpdateInterviewCardDto } from './dto/update-interview-card.dto';
import { InterviewCard } from './entities/interview-card.entity';
import { InterviewCardsService } from './interview-cards.service';

@ApiTags('Interview Cards')
@UsePipes(ValidationPipe)
@Controller('interview-cards')
export class InterviewCardsController {
  constructor(private readonly interviewCardsService: InterviewCardsService) {}

  @Auth(AuthType.None)
  @Get()
  findAll(
    @Query() query: FindInterviewCardsQueryDto
  ): Promise<InterviewCard[]> {
    return this.interviewCardsService.findAll(query);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<InterviewCard> {
    return this.interviewCardsService.findOne(id);
  }

  @Roles(Role.Emperor)
  @Post()
  create(
    @Body() createInterviewCardDto: CreateInterviewCardDto
  ): Promise<InterviewCard> {
    return this.interviewCardsService.create(createInterviewCardDto);
  }

  @Roles(Role.Emperor)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterviewCardDto: UpdateInterviewCardDto
  ): Promise<InterviewCard> {
    return this.interviewCardsService.update(id, updateInterviewCardDto);
  }

  @Roles(Role.Emperor)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.interviewCardsService.remove(id);
  }
}

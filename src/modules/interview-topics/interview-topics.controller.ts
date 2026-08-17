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

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { Auth } from '../iam/authentication/decorators/auth.decorators';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

import { CreateInterviewTopicDto } from './dto/create-interview-topic.dto';
import { UpdateInterviewTopicDto } from './dto/update-interview-topic.dto';
import { InterviewTopic } from './entities/interview-topic.entity';
import { InterviewTopicsService } from './interview-topics.service';

@ApiTags('Interview Topics')
@UsePipes(ValidationPipe)
@Controller('interview-topics')
export class InterviewTopicsController {
  constructor(
    private readonly interviewTopicsService: InterviewTopicsService
  ) {}

  @Auth(AuthType.None)
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<InterviewTopic[]> {
    return this.interviewTopicsService.findAll(paginationQuery);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<InterviewTopic> {
    return this.interviewTopicsService.findOne(id);
  }

  @Roles(Role.Emperor)
  @Post()
  create(
    @Body() createInterviewTopicDto: CreateInterviewTopicDto
  ): Promise<InterviewTopic> {
    return this.interviewTopicsService.create(createInterviewTopicDto);
  }

  @Roles(Role.Emperor)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterviewTopicDto: UpdateInterviewTopicDto
  ): Promise<InterviewTopic> {
    return this.interviewTopicsService.update(id, updateInterviewTopicDto);
  }

  @Roles(Role.Emperor)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.interviewTopicsService.remove(id);
  }
}

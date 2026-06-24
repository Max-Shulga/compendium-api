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

import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicCardsDto } from './dto/update-topic-cards.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './entities/topic.entity';
import { TopicsService } from './topics.service';

@ApiTags('Topics')
@UsePipes(ValidationPipe)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicService: TopicsService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto): Promise<Topic[]> {
    return this.topicService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Topic> {
    return this.topicService.findOne(id);
  }

  @Roles(Role.Emperor)
  @Post()
  create(@Body() createTopicDto: CreateTopicDto): Promise<Topic> {
    return this.topicService.create(createTopicDto);
  }

  @Roles(Role.Emperor)
  @Patch(':id')
  updateTopic(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto
  ): Promise<Topic> {
    return this.topicService.updateTopic(id, updateTopicDto);
  }

  @Roles(Role.Emperor)
  @Patch(':id/cards')
  updateTopicCards(
    @Param('id') topicId: string,
    @Body() updateTopicCardsDto: UpdateTopicCardsDto
  ): Promise<void> {
    return this.topicService.updateTopicCards(
      topicId,
      updateTopicCardsDto.cardIds
    );
  }
  @Roles(Role.Emperor)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.topicService.removeTopic(id);
  }
}

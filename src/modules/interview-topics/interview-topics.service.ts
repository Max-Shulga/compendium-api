import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { CreateInterviewTopicDto } from './dto/create-interview-topic.dto';
import { UpdateInterviewTopicDto } from './dto/update-interview-topic.dto';
import { InterviewTopic } from './entities/interview-topic.entity';

@Injectable()
export class InterviewTopicsService {
  constructor(
    @InjectRepository(InterviewTopic)
    private readonly interviewTopicRepository: Repository<InterviewTopic>
  ) {}

  findAll(paginationQuery: PaginationQueryDto): Promise<InterviewTopic[]> {
    const { limit, offset } = paginationQuery;

    return this.interviewTopicRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(id: string): Promise<InterviewTopic> {
    const topic = await this.interviewTopicRepository.findOne({
      where: { id: +id },
      relations: { cards: true },
      order: { cards: { order: 'ASC' } }
    });

    if (!topic) {
      throw new NotFoundException(`Interview topic with id ${id} not found`);
    }

    return topic;
  }

  create(
    createInterviewTopicDto: CreateInterviewTopicDto
  ): Promise<InterviewTopic> {
    const topic = this.interviewTopicRepository.create(createInterviewTopicDto);

    return this.interviewTopicRepository.save(topic);
  }

  async update(
    id: string,
    updateInterviewTopicDto: UpdateInterviewTopicDto
  ): Promise<InterviewTopic> {
    const topic = await this.interviewTopicRepository.preload({
      id: +id,
      ...updateInterviewTopicDto
    });
    if (!topic) {
      throw new NotFoundException(`Interview topic with id ${id} not found`);
    }

    return this.interviewTopicRepository.save(topic);
  }

  async remove(id: string): Promise<void> {
    const topic = await this.findOne(id);

    await this.interviewTopicRepository.remove(topic);
  }
}

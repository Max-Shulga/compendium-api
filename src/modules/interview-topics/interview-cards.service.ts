import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateInterviewCardDto } from './dto/create-interview-card.dto';
import { FindInterviewCardsQueryDto } from './dto/find-interview-cards-query.dto';
import { UpdateInterviewCardDto } from './dto/update-interview-card.dto';
import { InterviewCard } from './entities/interview-card.entity';
import { InterviewTopic } from './entities/interview-topic.entity';

@Injectable()
export class InterviewCardsService {
  constructor(
    @InjectRepository(InterviewCard)
    private readonly interviewCardRepository: Repository<InterviewCard>,
    @InjectRepository(InterviewTopic)
    private readonly interviewTopicRepository: Repository<InterviewTopic>
  ) {}

  findAll(query: FindInterviewCardsQueryDto): Promise<InterviewCard[]> {
    const { limit, offset, topicId } = query;

    return this.interviewCardRepository.find({
      where: topicId ? { topicId } : {},
      order: { order: 'ASC' },
      take: limit,
      skip: offset
    });
  }

  async findOne(id: string): Promise<InterviewCard> {
    const card = await this.interviewCardRepository.findOne({
      where: { id: +id }
    });
    if (!card) {
      throw new NotFoundException(`Interview card with id ${id} not found`);
    }

    return card;
  }

  async create(
    createInterviewCardDto: CreateInterviewCardDto
  ): Promise<InterviewCard> {
    await this.assertTopicExists(createInterviewCardDto.topicId);

    const card = this.interviewCardRepository.create(createInterviewCardDto);

    return this.interviewCardRepository.save(card);
  }

  async update(
    id: string,
    updateInterviewCardDto: UpdateInterviewCardDto
  ): Promise<InterviewCard> {
    if (updateInterviewCardDto.topicId !== undefined) {
      await this.assertTopicExists(updateInterviewCardDto.topicId);
    }

    const card = await this.interviewCardRepository.preload({
      id: +id,
      ...updateInterviewCardDto
    });
    if (!card) {
      throw new NotFoundException(`Interview card with id ${id} not found`);
    }

    return this.interviewCardRepository.save(card);
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);

    await this.interviewCardRepository.remove(card);
  }

  private async assertTopicExists(topicId: number): Promise<void> {
    const exists = await this.interviewTopicRepository.exists({
      where: { id: topicId }
    });
    if (!exists) {
      throw new NotFoundException(
        `Interview topic with id ${topicId} not found`
      );
    }
  }
}

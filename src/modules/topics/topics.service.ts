import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicCard } from './entities/topic-card.entity';
import { Topic } from './entities/topic.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly dataSource: DataSource
  ) {}

  findAll(paginationQuery: PaginationQueryDto): Promise<Topic[]> {
    const { limit, offset } = paginationQuery;

    return this.topicRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id: +id },
      relations: { topicCards: { card: true } }
    });

    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }

    return topic;
  }

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = await this.dataSource.transaction(async (manager) => {
      const created = await manager.save(
        manager.create(Topic, {
          name: createTopicDto.name,
          description: createTopicDto.description
        })
      );

      if (createTopicDto.cards?.length) {
        const topicCards = createTopicDto.cards.map((card, index) =>
          manager.create(TopicCard, {
            topicId: created.id,
            cardId: card.cardId,
            order: index
          })
        );

        await manager.save(topicCards);
      }

      return created;
    });

    return this.findOne(String(topic.id));
  }

  async updateTopic(
    id: string,
    updateTopicDto: UpdateTopicDto
  ): Promise<Topic> {
    const topic = await this.topicRepository.preload({
      id: +id,
      name: updateTopicDto.name,
      description: updateTopicDto.description
    });
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }

    await this.topicRepository.save(topic);

    return this.findOne(id);
  }

  async updateTopicCards(topicId: string, cardIds: number[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(TopicCard, { topicId: +topicId });

      if (!cardIds.length) return;

      const topicCards = cardIds.map((cardId, index) =>
        manager.create(TopicCard, {
          topicId: +topicId,
          cardId,
          order: index
        })
      );

      await manager.save(topicCards);
    });
  }

  async removeTopic(id: string): Promise<void> {
    const topic = await this.findOne(id);

    await this.topicRepository.remove(topic);
  }
}

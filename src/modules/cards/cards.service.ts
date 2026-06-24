import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>
  ) {}

  findAll(paginationQuery: PaginationQueryDto): Promise<Card[]> {
    const { limit, offset } = paginationQuery;

    return this.cardRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: +id }
    });
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    return card;
  }

  create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardRepository.create(createCardDto);

    return this.cardRepository.save(card);
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardRepository.preload({
      id: +id,
      ...updateCardDto
    });
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    return this.cardRepository.save(card);
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);

    await this.cardRepository.remove(card);
  }
}

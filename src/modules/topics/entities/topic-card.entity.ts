import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Card } from '@/modules/cards/entities/card.entity';

import { Topic } from './topic.entity';

@Entity()
export class TopicCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Topic, (topic) => topic.topicCards)
  topic!: Topic;

  @Column()
  topicId!: number;

  @ManyToOne(() => Card, (card) => card.topicCards)
  card!: Card;

  @Column()
  cardId!: number;

  @Column({ default: 0 })
  order!: number;
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { TopicCard } from '@/modules/topics/entities/topic-card.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  title!: string;

  @Column()
  text!: string;

  @Column({ nullable: true })
  examples?: string;

  @OneToMany(() => TopicCard, (tc) => tc.card)
  topicCards?: TopicCard[];
}

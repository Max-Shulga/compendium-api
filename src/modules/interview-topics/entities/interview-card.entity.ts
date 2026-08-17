import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { InterviewTopic } from './interview-topic.entity';

@Entity()
export class InterviewCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  text!: string;

  @ManyToOne(() => InterviewTopic, (topic) => topic.cards, {
    onDelete: 'CASCADE'
  })
  topic!: InterviewTopic;

  @Column()
  topicId!: number;

  @Column({ default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

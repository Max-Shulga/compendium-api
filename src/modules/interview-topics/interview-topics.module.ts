import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InterviewCard } from './entities/interview-card.entity';
import { InterviewTopic } from './entities/interview-topic.entity';
import { InterviewCardsController } from './interview-cards.controller';
import { InterviewCardsService } from './interview-cards.service';
import { InterviewTopicsController } from './interview-topics.controller';
import { InterviewTopicsService } from './interview-topics.service';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewTopic, InterviewCard])],
  controllers: [InterviewTopicsController, InterviewCardsController],
  providers: [InterviewTopicsService, InterviewCardsService],
  exports: [InterviewTopicsService, InterviewCardsService]
})
export class InterviewTopicsModule {}

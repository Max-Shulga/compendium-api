import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Card } from '@/modules/cards/entities/card.entity';
import { Topic } from '@/modules/topics/entities/topic.entity';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryItem } from './entities/category-item.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryItem, Topic, Card])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}

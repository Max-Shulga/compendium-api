import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { Card } from '@/modules/cards/entities/card.entity';
import { Topic } from '@/modules/topics/entities/topic.entity';

import { CategoryItemDto } from './dto/category-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryItem } from './entities/category-item.entity';
import { Category } from './entities/category.entity';
import { CategoryItemType } from './enums/category-item-type.enum';

export interface CategoryItemView {
  id: number;
  itemType: CategoryItemType;
  order: number;
  topic?: Topic;
  card?: Card;
  category?: Category;
}

export interface CategoryWithItems extends Omit<Category, 'categoryItems'> {
  categoryItems: CategoryItemView[];
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryItem)
    private readonly categoryItemRepository: Repository<CategoryItem>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(paginationQuery: PaginationQueryDto): Promise<Category[]> {
    const { limit, offset } = paginationQuery;

    const nestedCategoryIds = await this.categoryItemRepository
      .createQueryBuilder('categoryItem')
      .select('DISTINCT categoryItem.itemId', 'itemId')
      .where('categoryItem.itemType = :itemType', {
        itemType: CategoryItemType.Category
      })
      .getRawMany<{ itemId: number }>();

    const excludedIds = nestedCategoryIds.map((row) => row.itemId);

    return this.categoryRepository.find({
      where: excludedIds.length ? { id: Not(In(excludedIds)) } : {},
      take: limit,
      skip: offset
    });
  }

  async findOne(id: string): Promise<CategoryWithItems> {
    const category = await this.categoryRepository.findOne({
      where: { id: +id },
      relations: { categoryItems: true }
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return {
      ...category,
      categoryItems: await this.enrichItems(category.categoryItems ?? [])
    };
  }

  async create(
    createCategoryDto: CreateCategoryDto
  ): Promise<CategoryWithItems> {
    if (createCategoryDto.items?.length) {
      await this.validateItems(createCategoryDto.items);
    }

    const category = await this.dataSource.transaction(async (manager) => {
      const created = await manager.save(
        manager.create(Category, {
          name: createCategoryDto.name,
          description: createCategoryDto.description
        })
      );

      if (createCategoryDto.items?.length) {
        const categoryItems = createCategoryDto.items.map((item, index) =>
          manager.create(CategoryItem, {
            categoryId: created.id,
            itemType: item.itemType,
            itemId: item.itemId,
            order: index
          })
        );

        await manager.save(categoryItems);
      }

      return created;
    });

    return this.findOne(String(category.id));
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryWithItems> {
    const category = await this.categoryRepository.preload({
      id: +id,
      name: updateCategoryDto.name,
      description: updateCategoryDto.description
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await this.categoryRepository.save(category);

    return this.findOne(id);
  }

  async updateCategoryItems(
    categoryId: string,
    items: CategoryItemDto[]
  ): Promise<void> {
    const id = +categoryId;

    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    if (items.length) {
      await this.validateItems(items, id);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(CategoryItem, { categoryId: id });

      if (!items.length) return;

      const categoryItems = items.map((item, index) =>
        manager.create(CategoryItem, {
          categoryId: id,
          itemType: item.itemType,
          itemId: item.itemId,
          order: index
        })
      );

      await manager.save(categoryItems);
    });
  }

  async removeCategory(id: string): Promise<void> {
    const categoryId = +id;

    const category = await this.categoryRepository.findOneBy({
      id: categoryId
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(CategoryItem, {
        itemType: CategoryItemType.Category,
        itemId: categoryId
      });
      await manager.remove(category);
    });
  }

  private async validateItems(
    items: CategoryItemDto[],
    selfId?: number
  ): Promise<void> {
    const topicIds = this.uniqueIds(items, CategoryItemType.Topic);
    const cardIds = this.uniqueIds(items, CategoryItemType.Card);
    const categoryIds = this.uniqueIds(items, CategoryItemType.Category);

    if (topicIds.length) {
      const count = await this.topicRepository.count({
        where: { id: In(topicIds) }
      });
      if (count !== topicIds.length) {
        throw new BadRequestException('One or more topics not found');
      }
    }

    if (cardIds.length) {
      const count = await this.cardRepository.count({
        where: { id: In(cardIds) }
      });
      if (count !== cardIds.length) {
        throw new BadRequestException('One or more cards not found');
      }
    }

    if (categoryIds.length) {
      if (selfId !== undefined && categoryIds.includes(selfId)) {
        throw new BadRequestException('A category cannot contain itself');
      }

      const count = await this.categoryRepository.count({
        where: { id: In(categoryIds) }
      });
      if (count !== categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }

      if (selfId !== undefined) {
        for (const categoryId of categoryIds) {
          if (await this.isDescendantOf(categoryId, selfId)) {
            throw new BadRequestException(
              `Adding category ${categoryId} would create a circular reference`
            );
          }
        }
      }
    }
  }

  private uniqueIds(
    items: CategoryItemDto[],
    itemType: CategoryItemType
  ): number[] {
    return [
      ...new Set(
        items
          .filter((item) => item.itemType === itemType)
          .map((item) => item.itemId)
      )
    ];
  }

  private async isDescendantOf(
    startId: number,
    targetId: number
  ): Promise<boolean> {
    const visited = new Set<number>();
    const queue = [startId];

    while (queue.length) {
      const currentId = queue.shift()!;
      if (currentId === targetId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const children = await this.categoryItemRepository.find({
        where: { categoryId: currentId, itemType: CategoryItemType.Category }
      });

      queue.push(...children.map((child) => child.itemId));
    }

    return false;
  }

  private async enrichItems(
    categoryItems: CategoryItem[]
  ): Promise<CategoryItemView[]> {
    const topicIds = this.uniqueIds(categoryItems, CategoryItemType.Topic);
    const cardIds = this.uniqueIds(categoryItems, CategoryItemType.Card);
    const categoryIds = this.uniqueIds(
      categoryItems,
      CategoryItemType.Category
    );

    const [topics, cards, categories] = await Promise.all([
      topicIds.length
        ? this.topicRepository.findBy({ id: In(topicIds) })
        : Promise.resolve([]),
      cardIds.length
        ? this.cardRepository.findBy({ id: In(cardIds) })
        : Promise.resolve([]),
      categoryIds.length
        ? this.categoryRepository.findBy({ id: In(categoryIds) })
        : Promise.resolve([])
    ]);

    const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    const categoriesById = new Map(
      categories.map((category) => [category.id, category])
    );

    return categoryItems
      .map((item) => {
        const view: CategoryItemView = {
          id: item.id,
          itemType: item.itemType,
          order: item.order
        };

        if (item.itemType === CategoryItemType.Topic) {
          view.topic = topicsById.get(item.itemId);
        } else if (item.itemType === CategoryItemType.Card) {
          view.card = cardsById.get(item.itemId);
        } else {
          view.category = categoriesById.get(item.itemId);
        }

        return view;
      })
      .filter((view) => view.topic ?? view.card ?? view.category)
      .sort((a, b) => a.order - b.order);
  }
}

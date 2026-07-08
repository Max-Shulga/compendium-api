import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CategoryItemType } from '../enums/category-item-type.enum';

import { Category } from './category.entity';

@Entity()
export class CategoryItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Category, (category) => category.categoryItems, {
    onDelete: 'CASCADE'
  })
  category!: Category;

  @Column()
  categoryId!: number;

  @Column({ type: 'enum', enum: CategoryItemType })
  itemType!: CategoryItemType;

  @Column()
  itemId!: number;

  @Column({ default: 0 })
  order!: number;
}

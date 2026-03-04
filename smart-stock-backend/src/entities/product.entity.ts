import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Category } from './category.entity';

@Entity({ tableName: 'products' })
export class Product {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', unique: true })
  sku!: string;

  @Property({ type: 'number', default: 0 })
  current_quantity!: number;

  @Property({ type: 'number', default: 5 })
  min_threshold!: number;

  @ManyToOne({ entity: () => Category })
  category!: Category;
}
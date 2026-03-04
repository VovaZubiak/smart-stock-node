import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Transaction } from './transaction.entity';
import { Product } from './product.entity';

@Entity({ tableName: 'transaction_items' })
export class TransactionItem {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'number' })
  quantity!: number;

  @ManyToOne({ entity: () => Transaction })
  transaction!: Transaction;

  @ManyToOne({ entity: () => Product })
  product!: Product;
}
import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { User } from './user.entity';
import { TransactionItem } from './transaction-item.entity';

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity({ tableName: 'transactions' })
export class Transaction {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Enum({ items: () => TransactionType })
  type!: TransactionType;

  @Property({ type: 'string', nullable: true })
  comment?: string;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @ManyToOne({ entity: () => User })
  user!: User;

  @OneToMany({ entity: () => TransactionItem, mappedBy: 'transaction' })
  items = new Collection<TransactionItem>(this);
}
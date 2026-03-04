import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from '../entities/transaction.entity';
import { TransactionItem } from '../entities/transaction-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateTransactionDto, userId: number) {
    const user = this.em.getReference(User, userId);

    const transaction = new Transaction();
    transaction.type = dto.type;
    transaction.comment = dto.comment;
    transaction.user = user;

    this.em.persist(transaction);

    for (const itemDto of dto.items) {
      const product = await this.em.findOne(Product, { id: itemDto.productId });
      
      if (!product) {
        throw new NotFoundException(`Товар з ID ${itemDto.productId} не знайдено`);
      }

      if (dto.type === 'IN') {
        product.current_quantity += itemDto.quantity;
      } else if (dto.type === 'OUT') {
        if (product.current_quantity < itemDto.quantity) {
          throw new BadRequestException(
            `Недостатньо товару "${product.name}"! Залишок: ${product.current_quantity}`
          );
        }
        product.current_quantity -= itemDto.quantity;
      }

      const transactionItem = new TransactionItem();
      transactionItem.quantity = itemDto.quantity;
      transactionItem.product = product;
      transactionItem.transaction = transaction;

      this.em.persist([transactionItem, product]);
    }

    await this.em.flush();

    return transaction;
  }

  async findAll() {
    return await this.em.find(Transaction, {}, { populate: ['user', 'items.product'] });
  }
}
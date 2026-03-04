import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Transaction } from '../entities/transaction.entity';
import { Product } from '../entities/product.entity';
import { TransactionItem } from '../entities/transaction-item.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Transaction, Product, TransactionItem])], 
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}

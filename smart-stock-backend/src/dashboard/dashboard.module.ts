import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Product, Transaction])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
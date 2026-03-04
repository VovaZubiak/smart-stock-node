import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly em: EntityManager) {}

  async getSummary() {
    const products = await this.em.find(Product, {});
    const totalProducts = products.length;
    const totalItemsInStock = products.reduce((sum, p) => sum + p.current_quantity, 0);
    
    const lowStockItems = products.filter(p => p.current_quantity <= p.min_threshold);

    const recentTransactions = await this.em.find(
      Transaction, 
      {},
      { 
        orderBy: { createdAt: 'DESC' },
        limit: 5,
        populate: ['user', 'items.product']
      }
    );

    return {
      overview: {
        totalProducts,
        totalItemsInStock,
        lowStockAlerts: lowStockItems.length,
      },
      lowStockItems,
      recentTransactions,
    };
  }
}

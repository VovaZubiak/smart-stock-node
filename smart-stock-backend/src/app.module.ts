import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, MikroOrmModule.forRoot(), CategoriesModule, ProductsModule, TransactionsModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

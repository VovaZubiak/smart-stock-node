import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateProductDto) {
    const category = await this.em.findOne(Category, { id: dto.categoryId });
    if (!category) {
      throw new NotFoundException(`Категорію з ID ${dto.categoryId} не знайдено`);
    }

    const product = new Product();
    product.name = dto.name;
    product.sku = dto.sku;
    product.category = category;
    
    if (dto.current_quantity !== undefined) product.current_quantity = dto.current_quantity;
    if (dto.min_threshold !== undefined) product.min_threshold = dto.min_threshold;

    this.em.persist(product);
    await this.em.flush();

    return product;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, categoryId?: string) {
    const where: any = {};

    if (categoryId && categoryId !== 'all') {
      where.category = { id: parseInt(categoryId) };
    }

    if (search) {
      where.$or = [
        { name: { $ilike: `%${search}%` } },
        { sku: { $ilike: `%${search}%` } },
      ];
    }

    const [data, total] = await this.em.findAndCount(Product, where, {
      populate: ['category'],
      limit: limit,
      offset: (page - 1) * limit,
      orderBy: { id: 'DESC' },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async remove(id: number) {
    const product = await this.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundException(`Товар з ID ${id} не знайдено`);
    }
    
    this.em.remove(product);
    await this.em.flush();
    return { message: 'Товар успішно видалено' };
  }


  async findOne(id: number) {
    const product = await this.em.findOne(Product, { id }, { populate: ['category'] });
    
    if (!product) {
      throw new NotFoundException(`Товар з ID ${id} не знайдено`);
    }
    
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.name) product.name = dto.name;
    if (dto.sku) product.sku = dto.sku;
    if (dto.current_quantity !== undefined) product.current_quantity = dto.current_quantity;
    if (dto.min_threshold !== undefined) product.min_threshold = dto.min_threshold;

    if (dto.categoryId) {
      const category = await this.em.findOne(Category, { id: dto.categoryId });
      if (!category) {
        throw new NotFoundException(`Категорію з ID ${dto.categoryId} не знайдено`);
      }
      product.category = category;
    }

    this.em.persist(product);
    await this.em.flush();

    return product;
  }
}
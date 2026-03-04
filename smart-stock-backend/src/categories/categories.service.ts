import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return await this.em.find(Category, {});
  }

  async create(dto: CreateCategoryDto) {
    const category = new Category();
    category.name = dto.name;
    category.description = dto.description;

    this.em.persist(category); 
    await this.em.flush();     

    return category;
  }

  async remove(id: number) {
    const category = await this.em.findOne(Category, { id });
    if (!category) {
      throw new NotFoundException(`Категорію з ID ${id} не знайдено`);
    }
    
    this.em.remove(category);
    await this.em.flush();

    return { message: 'Категорію успішно видалено' };
  }
}
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Назва товару обов\'язкова' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Артикул обов\'язковий' })
  sku: string;

  @IsNumber()
  @IsNotEmpty({ message: 'ID категорії обов\'язковий' })
  categoryId: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  current_quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  min_threshold?: number;
}

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Назва категорії не може бути порожньою' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
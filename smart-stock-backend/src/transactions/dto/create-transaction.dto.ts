import { IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../entities/transaction.entity';

export class TransactionItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsPositive({ message: 'Кількість має бути більшою за 0' })
  quantity: number;
}

export class CreateTransactionDto {
  @IsEnum(TransactionType, { message: 'Тип має бути IN або OUT' })
  type: TransactionType;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];
}
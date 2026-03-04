import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    const userId = req.user.userId; 
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions' })
  findAll() {
    return this.transactionsService.findAll();
  }
}
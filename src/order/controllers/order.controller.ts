import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { GenerateWaveDto } from '../dtos/generate-wave-dto';
import { OrderDto, SetupOrdersDto } from '../dtos/setup-orders.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  public async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.orderService.getPaginatedOrders(page, size);
  }

  @Post('generate-wave')
  public async generateWave(@Body() dto: GenerateWaveDto) {
    const { endTime } = dto;
    return this.orderService.generateWave(new Date(endTime));
  }

  @Post('setup-orders')
  public async setupOrders(@Body() dto: SetupOrdersDto) {
    return this.orderService.setupOrders(dto);
  }

  @Post('create-order')
  public async createOrder(@Body() dto: OrderDto) {
    return this.orderService.createOrder(dto);
  }
}

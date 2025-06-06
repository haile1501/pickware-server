import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { OrderDto } from '../dtos/setup-orders.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Get('preview-plan')
  public async previewPickingPlan() {
    return this.orderService.previewPickingPlan();
  }

  @Post('start-picking')
  public async startPicking(@Body() dto: { algo: string }) {
    return this.orderService.startPicking(dto.algo);
  }

  @Post('upload-orders')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadOrders(@UploadedFile() file: Express.Multer.File) {
    const orders: OrderDto[] = JSON.parse(file.buffer.toString());
    return this.orderService.uploadOrders(orders);
  }
}

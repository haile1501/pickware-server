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
import { GenerateWaveDto } from '../dtos/generate-wave-dto';
import { OrderDto, SetupOrdersDto } from '../dtos/setup-orders.dto';
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

  @Post('generate-wave')
  public async generateWave(@Body() dto: GenerateWaveDto) {
    const { endTime, algorithm } = dto;
    return this.orderService.generateWave(new Date(endTime), algorithm);
  }

  @Post('setup-orders')
  public async setupOrders(@Body() dto: SetupOrdersDto) {
    return this.orderService.setupOrders(dto);
  }

  @Post('create-order')
  public async createOrder(@Body() dto: OrderDto) {
    return this.orderService.createOrder(dto);
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

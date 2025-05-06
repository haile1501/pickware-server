import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('list')
  public async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.inventoryService.getPaginatedProducts(page, size);
  }

  @Get('cartons')
  public async getAllCartons() {
    return this.inventoryService.getAllCartons();
  }

  @Get(':productId/cartons')
  public async getProductCartons(@Param('productId') productId: string) {
    return this.inventoryService.getProductCartons(productId);
  }
}

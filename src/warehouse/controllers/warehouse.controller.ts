import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SetupBlocksDto } from '../dtos/setup-blocks.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('layout')
  public getLayout() {
    return this.warehouseService.getLayout();
  }

  @Post('upload-layout')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLayout(@UploadedFile() file: Express.Multer.File) {
    const fileContent = file.buffer.toString('utf-8');

    const matrix = fileContent
      .trim()
      .split('\n')
      .map((line) => line.trim().split(/\s+/));

    await this.warehouseService.saveLayout(matrix);

    return {
      message: 'Layout uploaded successfully',
      matrix,
    };
  }

  @Post('setup-blocks')
  async setupBlocks(@Body() setUpBlocksDto: SetupBlocksDto) {
    return this.warehouseService.setupBlocks(setUpBlocksDto);
  }

  @Delete()
  async deleteWarehouse() {
    return this.warehouseService.deleteWarehouse();
  }
}

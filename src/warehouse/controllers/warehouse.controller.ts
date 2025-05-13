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

  @Post('upload-blocks')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBlocks(@UploadedFile() file: Express.Multer.File) {
    // Parse the file content as JSON
    const blocks = JSON.parse(file.buffer.toString('utf-8'));

    // Validate the structure of the blocks (optional, if needed)
    if (!Array.isArray(blocks)) {
      throw new Error('Invalid file format: Expected an array of blocks');
    }

    // Pass the parsed blocks to the service for processing
    await this.warehouseService.setupBlocks({ blocks });

    return {
      message: 'Blocks uploaded successfully',
      blocks,
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

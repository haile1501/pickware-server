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
import * as XLSX from 'xlsx';
import { CreateProductModel } from 'src/inventory/models/create-product.model';
import { CreateCartonModel } from 'src/inventory/models/create-carton.model';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('layout')
  public getLayoutMatrix() {
    return this.warehouseService.getLayoutMatrix();
  }

  @Post('upload-layout')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLayout(@UploadedFile() file: Express.Multer.File) {
    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.trim().split('\n');

    let startPos: { x: number; y: number } | null = null;
    let dropPos: { x: number; y: number } | null = null;
    const matrix: string[][] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('startPos:')) {
        const [x, y] = trimmedLine
          .replace('startPos:', '')
          .trim()
          .split('-')
          .map(Number);
        startPos = { x, y };
      } else if (trimmedLine.startsWith('dropPos:')) {
        const [x, y] = trimmedLine
          .replace('dropPos:', '')
          .trim()
          .split('-')
          .map(Number);
        dropPos = { x, y };
      } else if (trimmedLine.length > 0 && /^[0-9xXyY\s]+$/.test(trimmedLine)) {
        const row = trimmedLine.split(/\s+/);
        matrix.push(row);
      }
    }

    if (!startPos || !dropPos) {
      throw new Error('Missing startPos or dropPos in the uploaded layout');
    }

    await this.warehouseService.saveLayout(matrix, startPos, dropPos);

    return {
      message: 'Layout uploaded successfully',
      matrix,
      startPos,
      dropPos,
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

  @Post('upload-products')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProducts(@UploadedFile() file: Express.Multer.File) {
    // Parse the uploaded file as an XLSX workbook
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    // Get the first sheet from the workbook
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const rawProducts = XLSX.utils.sheet_to_json(sheet, {
      header: ['name', 'quantity', 'sku'],
      defval: null,
      raw: true, // Ensures raw cell values are preserved,
      range: 1,
    });

    // Ensure quantity is a number
    const products = rawProducts.map((product: CreateProductModel) => ({
      ...(product as CreateProductModel),
      quantity: Number(product.quantity), // Explicitly cast quantity to a number
    }));

    // Validate the structure of the products
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error(
        'Invalid file format: Expected a non-empty sheet with columns name, quantity, and sku',
      );
    }

    // Pass the parsed products to the service for processing
    await this.warehouseService.importProducts(
      products as CreateProductModel[],
    );

    return {
      message: 'Products uploaded successfully',
    };
  }

  @Post('upload-cartons')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCartons(@UploadedFile() file: Express.Multer.File) {
    // Parse the uploaded file as an XLSX workbook
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    // Get the first sheet from the workbook
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const rawCartons = XLSX.utils.sheet_to_json(sheet, {
      header: [
        'sku',
        'quantity',
        'blockOrder',
        'shelfOrder',
        'cellOrder',
        'cellLevel',
      ],
      defval: null,
      raw: true, // Ensures raw cell values are preserved,
      range: 1,
    });

    // Ensure quantity is a number
    const cartons = rawCartons.map((carton: CreateCartonModel) => ({
      ...carton,
      quantity: Number(carton.quantity), // Explicitly cast quantity to a number
    }));

    // Validate the structure of the products
    if (!Array.isArray(cartons) || cartons.length === 0) {
      throw new Error(
        'Invalid file format: Expected a non-empty sheet with columns name, quantity, and sku',
      );
    }

    // Pass the parsed products to the service for processing
    await this.warehouseService.importCartons(cartons as CreateCartonModel[]);

    return {
      message: 'Cartons uploaded successfully',
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

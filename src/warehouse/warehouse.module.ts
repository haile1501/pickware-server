import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Layout, LayoutSchema } from './schemas/layout.schema';
import { Block, BlockSchema } from './schemas/block.schema';
import { Shelf, ShelfSchema } from './schemas/shelf.schema';
import { WarehouseController } from './controllers/warehouse.controller';
import { LayoutRepository } from './repositories/layout.repository';
import { ShelfRepository } from './repositories/shelf.repository';
import { BlockRepository } from './repositories/block.repository';
import { WarehouseService } from './services/warehouse.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Layout.name,
        schema: LayoutSchema,
      },
      {
        name: Block.name,
        schema: BlockSchema,
      },
      {
        name: Shelf.name,
        schema: ShelfSchema,
      },
    ]),
  ],
  controllers: [WarehouseController],
  providers: [
    LayoutRepository,
    ShelfRepository,
    BlockRepository,
    WarehouseService,
  ],
})
export class WarehouseModule {}

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Layout, LayoutSchema } from './schemas/layout.schema';
import { Block, BlockSchema } from './schemas/block.schema';
import { WarehouseController } from './controllers/warehouse.controller';
import { LayoutRepository } from './repositories/layout.repository';
import { BlockRepository } from './repositories/block.repository';
import { WarehouseService } from './services/warehouse.service';
import { InventoryModule } from 'src/inventory/inventory.module';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { OrderModule } from 'src/order/order.module';

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
    ]),
    forwardRef(() => InventoryModule),
    VehicleModule,
    OrderModule,
  ],
  controllers: [WarehouseController],
  providers: [LayoutRepository, BlockRepository, WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}

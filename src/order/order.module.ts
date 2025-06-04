import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Wave, WaveSchema } from './schemas/wave.schema';
import { OrderRepository } from './repositories/order.repository';
import { WaveRepository } from './repositories/wave.repository';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { WarehouseModule } from 'src/warehouse/warehouse.module';
import { JobsPreview, JobsPreviewSchema } from './schemas/jobs-preview.schema';
import { JobsPreviewRepository } from './repositories/jobs-preview.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Wave.name,
        schema: WaveSchema,
      },
      { name: JobsPreview.name, schema: JobsPreviewSchema },
    ]),
    forwardRef(() => VehicleModule),
    forwardRef(() => InventoryModule),
    forwardRef(() => WarehouseModule),
  ],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    WaveRepository,
    OrderService,
    JobsPreviewRepository,
  ],
  exports: [OrderService],
})
export class OrderModule {}

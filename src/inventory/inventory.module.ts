import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { Carton, CartonSchema } from './schemas/carton.schema';
import { InventoryController } from './controllers/inventory.controller';
import { ProductRepository } from './repositories/product.repository';
import { CartonRepository } from './repositories/carton.repository';
import { InventoryService } from './services/inventory.service';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Carton.name,
        schema: CartonSchema,
      },
    ]),
    forwardRef(() => VehicleModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [InventoryController],
  providers: [ProductRepository, CartonRepository, InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { Job, JobSchema } from './schemas/job.schema';
import { VehicleService } from './services/vehicle.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { JobRepository } from './repositories/job.repository';
import { VehicleController } from './controllers/vehicle.controller';
import { WarehouseModule } from 'src/warehouse/warehouse.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Vehicle.name,
        schema: VehicleSchema,
      },
      {
        name: Job.name,
        schema: JobSchema,
      },
    ]),
    forwardRef(() => WarehouseModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository, JobRepository],
  exports: [VehicleService],
})
export class VehicleModule {}

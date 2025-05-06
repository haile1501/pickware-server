import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Wave, WaveSchema } from './schemas/wave.schema';
import { OrderRepository } from './repositories/order.repository';
import { WaveRepository } from './repositories/wave.repository';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';

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
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderRepository, WaveRepository, OrderService],
  exports: [OrderService],
})
export class OrderModule {}

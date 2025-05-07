import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { WaveRepository } from '../repositories/wave.repository';
import { VehicleService } from 'src/vehicle/services/vehicle.service';
import { SetupOrdersDto } from '../dtos/setup-orders.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly waveRepository: WaveRepository,
    private readonly vehicleService: VehicleService,
  ) {}

  public async getPaginatedOrders(page: number, size: number) {
    const [data, total] = await Promise.all([
      this.orderRepository.findPaginated(page, size),
      this.orderRepository.countAll(),
    ]);

    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      data,
    };
  }

  public async clearOrderAndWave() {
    await this.orderRepository.clearAll();
    await this.waveRepository.clearAll();
  }

  public async generateWave(startTime: Date, endTime: Date) {
    const orders = await this.orderRepository.getOrdersBetweenStartEnd(
      startTime,
      endTime,
    );

    const newWave = await this.waveRepository.createWave(orders.length);
    const waveId = newWave._id.toString();
    await Promise.all(
      orders.map((order) => {
        order.waveId = waveId;
        return order.save();
      }),
    );

    const vehicles = await this.vehicleService.list();
  }

  public async setupOrders(data: SetupOrdersDto) {
    return this.orderRepository.setupOrders(data);
  }
}

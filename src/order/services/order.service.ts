import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { WaveRepository } from '../repositories/wave.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly waveRepository: WaveRepository,
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
}

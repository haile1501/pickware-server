import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { WaveRepository } from '../repositories/wave.repository';
import { VehicleService } from 'src/vehicle/services/vehicle.service';
import { SetupOrdersDto } from '../dtos/setup-orders.dto';
import { Order } from '../schemas/order.schema';
import { InventoryService } from 'src/inventory/services/inventory.service';
import { CartonDoc } from 'src/inventory/schemas/carton.schema';
import { generateJob } from 'src/algorithm';
import { WarehouseService } from 'src/warehouse/services/warehouse.service';
import { Action } from 'src/vehicle/constants/action.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly waveRepository: WaveRepository,
    private readonly vehicleService: VehicleService,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
  ) {}

  public async getPaginatedOrders(page: number, size: number) {
    const [data, total] = await Promise.all([
      this.orderRepository.findPaginatedBySku(page, size),
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

  public async generateWave(endTime: Date) {
    const orders =
      await this.orderRepository.getPendingOrdersBeforeEndTime(endTime);

    const newWave = await this.waveRepository.createWave(orders.length);
    const waveId = newWave._id.toString();
    await Promise.all(
      orders.map((order) => {
        order.waveId = waveId;
        // order.status = OrderStatusEnum.Processing;
        return order.save();
      }),
    );

    const layout = await this.warehouseService.getLayout();

    const vehicles = await this.vehicleService.list();
    const cartonsToPick = await this.calculateCartonsToPick(orders);

    const jobs = generateJob(
      cartonsToPick.map((item) => ({
        id: item.toJSON().id,
        coordinate: item.toJSON().coordinate,
        shelfOrder: item.toJSON().shelfOrder,
      })),
      vehicles.map((item) => ({
        code: item.toJSON().code,
        startPos: item.toJSON().startPos,
      })),
      layout.toJSON().vehicleDropPos,
      layout.toJSON().matrix,
    );

    return this.vehicleService.createJobs(
      jobs.map((job) => ({
        waveId: waveId,
        vehicleCode: job.code,
        cartons: job.cartons.map((carton) => ({ id: carton.id })),
        steps: job.path.map((step) => ({
          coordinate: { x: step.x, y: step.y },
          action: step.action as Action,
          pickPos: step.pickPos,
        })),
      })),
    );
  }

  public async setupOrders(data: SetupOrdersDto) {
    return this.orderRepository.setupOrders(data);
  }

  private async calculateCartonsToPick(orders: Order[]): Promise<CartonDoc[]> {
    const skuSet = new Set<string>();
    for (const order of orders) {
      for (const orderline of order.orderlines) {
        skuSet.add(orderline.sku);
      }
    }

    const skus = Array.from(skuSet);

    // Use Promise.all to fetch cartons for all SKUs in parallel
    const cartons = await Promise.all(
      skus.map(async (sku) => {
        const cartonsForSku =
          await this.inventoryService.getProductCartons(sku);
        if (cartonsForSku.length > 0) {
          const randomIndex = Math.floor(Math.random() * cartonsForSku.length);
          return cartonsForSku[randomIndex];
        }
        return null;
      }),
    );

    // Filter out any nulls (in case no cartons found for a SKU)
    return cartons.filter(Boolean);
  }
}

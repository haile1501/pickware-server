import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { WaveRepository } from '../repositories/wave.repository';
import { VehicleService } from 'src/vehicle/services/vehicle.service';
import { OrderDto } from '../dtos/setup-orders.dto';
import { Order } from '../schemas/order.schema';
import { InventoryService } from 'src/inventory/services/inventory.service';
import { CartonDoc } from 'src/inventory/schemas/carton.schema';
import { WarehouseService } from 'src/warehouse/services/warehouse.service';
// import { Action } from 'src/vehicle/constants/action.enum';
import { generatePreviewPlan } from 'src/algorithm/methods/generate-preview';
import { JobsPreview } from '../schemas/jobs-preview.schema';
import { Action } from 'src/vehicle/constants/action.enum';
import { JobsPreviewRepository } from '../repositories/jobs-preview.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly waveRepository: WaveRepository,
    @Inject(forwardRef(() => VehicleService))
    private readonly vehicleService: VehicleService,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
    private readonly jobsPreviewRepository: JobsPreviewRepository,
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

  public async finishWave(waveId: string) {
    await this.orderRepository.fulfillOrders(waveId);
    await this.waveRepository.finishWave(waveId);
  }

  public async previewPickingPlan() {
    const activePreviewPlan = await this.jobsPreviewRepository.getActive();
    if (activePreviewPlan) {
      return {
        ...activePreviewPlan.toJSON(),
        algoDetails: activePreviewPlan.algoDetails.map((item) => ({
          ...item,
          jobs: null,
        })),
      };
    }

    const orders = await this.orderRepository.getOrders();

    const layout = await this.warehouseService.getLayout();

    const vehicles = await this.vehicleService.list();
    const cartonsToPick = await this.calculateCartonsToPick(orders);

    const results = generatePreviewPlan(
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

    const jobsPreview: JobsPreview = {
      waveId: '1',
      withoutCollisionHandlingData: {
        estimatedPickingTime: results.noConflictResult.estimatedPickingTime,
        totalPathLength: results.noConflictResult.totalPathLength,
        averagePathLength: results.noConflictResult.averagePathLength,
      },
      algoDetails: [],
      active: true,
    };

    jobsPreview.algoDetails.push({
      algoName: 'ca',
      estimatedPickingTime:
        results.cooperativeAStarResult.metrics.estimatedPickingTime,
      estimatedVehiclesStoppingTime:
        results.cooperativeAStarResult.metrics.estimatedVehiclesStoppingTime,
      idleSteps: results.cooperativeAStarResult.metrics.idleSteps,
      totalPathLength: results.cooperativeAStarResult.metrics.totalPathLength,
      averagePathLength:
        results.cooperativeAStarResult.metrics.averagePathLength,
      jobs: results.cooperativeAStarResult.vehicles.map((vehicle) => ({
        vehicleCode: vehicle.code,
        cartons: vehicle.job.cartons,
        steps: vehicle.path.map((step) => ({
          coordinate: { x: step.x, y: step.y },
          action: step.action as Action,
          pickPos: step.pickPos,
        })),
      })),
      conflictsResolved: 0,
      totalConstraintsAdded: 0,
    });

    jobsPreview.algoDetails.push({
      algoName: 'cbs',
      estimatedPickingTime: results.cbsResult.metrics.estimatedPickingTime,
      estimatedVehiclesStoppingTime:
        results.cbsResult.metrics.estimatedVehiclesStoppingTime,
      idleSteps: results.cbsResult.metrics.idleSteps,
      totalPathLength: results.cbsResult.metrics.totalPathLength,
      averagePathLength: results.cbsResult.metrics.averagePathLength,
      jobs: results.cbsResult.vehicles.map((vehicle) => ({
        vehicleCode: vehicle.code,
        cartons: vehicle.job.cartons,
        steps: vehicle.path.map((step) => ({
          coordinate: { x: step.x, y: step.y },
          action: step.action as Action,
          pickPos: step.pickPos,
        })),
      })),
      conflictsResolved: 0,
      totalConstraintsAdded: 0,
    });

    const savedJobsPreview = await this.jobsPreviewRepository.save(jobsPreview);
    return {
      ...savedJobsPreview.toJSON(),
      algoDetails: savedJobsPreview.algoDetails.map((item) => ({
        ...item,
        jobs: null,
      })),
    };
  }

  public async startPicking(algo: string) {
    const jobPreview = await this.jobsPreviewRepository.getActive();
    const algoDetail = jobPreview.algoDetails.find(
      (item) => item.algoName === algo,
    );

    return this.vehicleService.createJobs(
      algoDetail.jobs.map((job) => ({
        waveId: '1',
        vehicleCode: job.vehicleCode,
        cartons: job.cartons.map((carton) => ({
          id: carton.id.toString(),
        })),
        steps: job.steps.map((step) => ({
          coordinate: step.coordinate,
          action: step.action as Action,
          pickPos: step.pickPos,
        })),
      })),
    );
  }

  public async uploadOrders(orders: OrderDto[]) {
    await this.orderRepository.clearAll();
    await this.jobsPreviewRepository.clearAll();
    await this.vehicleService.clearJobs();
    return this.orderRepository.uploadOrders(orders);
  }

  public async clearOrders() {
    return await this.orderRepository.clearAll();
  }

  public async clearJobPreview() {
    return await this.jobsPreviewRepository.clearAll();
  }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CartonRepository } from '../repositories/carton.repository';
// import { Block } from 'src/warehouse/schemas/block.schema';
import { CreateProductModel } from '../models/create-product.model';
import { CreateCartonModel } from '../models/create-carton.model';
import { VehicleService } from 'src/vehicle/services/vehicle.service';
import { OrderService } from 'src/order/services/order.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartonRepository: CartonRepository,
    @Inject(forwardRef(() => VehicleService))
    private readonly vehicleService: VehicleService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  public async getPaginatedProducts(page: number, size: number) {
    const [data, total] = await Promise.all([
      this.productRepository.findPaginated(page, size),
      this.productRepository.countAll(),
    ]);

    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      data,
    };
  }

  public async clearInventory() {
    await this.orderService.clearOrders();
    await this.orderService.clearJobPreview();
    await this.cartonRepository.clearAll();
    await this.productRepository.clearAll();
    await this.vehicleService.clearJobs();
  }

  public async getAllCartons() {
    // Fetch blocks and cartons
    // const blocks = await this.warehouseService.getBlocks();
    const cartons = await this.cartonRepository.getAllCartons();

    // Map block order to block itself
    // const blockMap = new Map<number, Block>();
    // blocks.forEach((block) => {
    //   blockMap.set(block.blockOrder, block);
    // });

    // // Map cartons to their corresponding blocks and calculate coordinates
    // const cartonsWithCoordinates = cartons.map((carton) => {
    //   const block = blockMap.get(carton.blockOrder);

    //   if (!block) {
    //     throw new Error(`Block with order ${carton.blockOrder} not found`);
    //   }

    //   const coordinates = {
    //     x: 0,
    //     y: 0,
    //     z: 0,
    //   };

    //   if (carton.shelfOrder % 2 !== 0) {
    //     coordinates.x = (3 * carton.shelfOrder - 3) / 2 + block.rootXCoordinate;
    //   } else {
    //     coordinates.x = (3 * carton.shelfOrder - 4) / 2 + block.rootXCoordinate;
    //   }

    //   coordinates.y = block.rootYCoordinate + carton.cellOrder - 1;
    //   coordinates.z = carton.cellLevel;

    //   return {
    //     ...carton.toJSON(),
    //     coordinates,
    //   };
    // });

    // return cartonsWithCoordinates;
    return cartons;
  }

  public async getProductCartons(sku: string) {
    // const blocks = await this.warehouseService.getBlocks();
    const cartons = await this.cartonRepository.getProductCartons(sku);

    // Map block order to block itself
    // const blockMap = new Map<number, Block>();
    // blocks.forEach((block) => {
    //   blockMap.set(block.blockOrder, block);
    // });

    // // Map cartons to their corresponding blocks and calculate coordinates
    // const cartonsWithCoordinates = cartons.map((carton) => {
    //   const block = blockMap.get(carton.blockOrder);

    //   if (!block) {
    //     throw new Error(`Block with order ${carton.blockOrder} not found`);
    //   }

    //   const coordinates = {
    //     x: 0,
    //     y: 0,
    //     z: 0,
    //   };

    //   if (carton.shelfOrder % 2 !== 0) {
    //     coordinates.x = (3 * carton.shelfOrder - 3) / 2 + block.rootXCoordinate;
    //   } else {
    //     coordinates.x = (3 * carton.shelfOrder - 4) / 2 + block.rootXCoordinate;
    //   }

    //   coordinates.y = block.rootYCoordinate + carton.cellOrder - 1;
    //   coordinates.z = carton.cellLevel;

    //   return {
    //     ...carton.toJSON(),
    //     coordinates,
    //   };
    // });

    // return cartonsWithCoordinates;
    return cartons;
  }

  public async importProduct(products: CreateProductModel[]) {
    return await this.productRepository.importProducts(products);
  }

  public async importCarton(cartons: CreateCartonModel[]) {
    return await this.cartonRepository.importCartons(cartons);
  }
}

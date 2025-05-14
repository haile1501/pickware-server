import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LayoutRepository } from '../repositories/layout.repository';
import { SetupBlocksDto } from '../dtos/setup-blocks.dto';
import { BlockRepository } from '../repositories/block.repository';
import { InventoryService } from 'src/inventory/services/inventory.service';
import { OrderService } from 'src/order/services/order.service';
import { VehicleService } from 'src/vehicle/services/vehicle.service';
import { CreateProductModel } from 'src/inventory/models/create-product.model';
import { CreateCartonModel } from 'src/inventory/models/create-carton.model';
import { Block } from '../schemas/block.schema';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly layoutRepository: LayoutRepository,
    private readonly blockRepository: BlockRepository,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
    private readonly orderService: OrderService,
    private readonly vehicleService: VehicleService,
  ) {}

  public async getLayout() {
    const layout = await this.layoutRepository.get();
    if (!layout) {
      throw new NotFoundException();
    }

    return layout.matrix;
  }

  public async getBlocks() {
    return this.blockRepository.getBlocks();
  }

  public saveLayout(matrix: string[][]) {
    return this.layoutRepository.save(matrix);
  }

  public setupBlocks(setUpBlocksDto: SetupBlocksDto) {
    return this.blockRepository.setUpBlocks(setUpBlocksDto);
  }

  public importProducts(products: CreateProductModel[]) {
    return this.inventoryService.importProduct(products);
  }

  public async importCartons(cartons: CreateCartonModel[]) {
    const blocks = await this.getBlocks();

    // Map block order to block itself
    const blockMap = new Map<number, Block>();
    blocks.forEach((block) => {
      blockMap.set(block.blockOrder, block);
    });

    // Map cartons to their corresponding blocks and calculate coordinate
    const cartonsWithCoordinates = cartons.map((carton) => {
      const block = blockMap.get(carton.blockOrder);

      if (!block) {
        throw new Error(`Block with order ${carton.blockOrder} not found`);
      }

      const coordinate = {
        x: 0,
        y: 0,
        z: 0,
      };

      if (carton.shelfOrder % 2 !== 0) {
        coordinate.x = (3 * carton.shelfOrder - 3) / 2 + block.rootXCoordinate;
      } else {
        coordinate.x = (3 * carton.shelfOrder - 4) / 2 + block.rootXCoordinate;
      }

      coordinate.y = block.rootYCoordinate + carton.cellOrder - 1;
      coordinate.z = carton.cellLevel;

      return {
        ...carton,
        coordinate,
      };
    });

    return await this.inventoryService.importCarton(cartonsWithCoordinates);
  }

  // clear layout
  // clear block
  // clear order
  // clear product
  // clear carton
  // clear vehicle
  // clear wave
  public async deleteWarehouse() {
    await Promise.all([
      this.inventoryService.clearInventory(),
      this.orderService.clearOrderAndWave(),
      this.layoutRepository.clear(),
      this.blockRepository.clearBlock(),
      // this.vehicleService.clearVehicleAndJob(),
    ]);
  }
}

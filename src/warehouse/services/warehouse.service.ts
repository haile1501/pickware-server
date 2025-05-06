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
      this.vehicleService.clearVehicleAndJob(),
    ]);
  }
}

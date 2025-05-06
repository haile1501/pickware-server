import { Controller, Get } from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('list')
  public list() {
    return this.vehicleService.list();
  }
}

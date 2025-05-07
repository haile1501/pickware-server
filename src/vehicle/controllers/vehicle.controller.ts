import { Body, Controller, Get, Post } from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { SetupVehiclesDto } from '../dtos/setup-vehicles.dto';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('list')
  public list() {
    return this.vehicleService.getVehiclesWithJob();
  }

  @Post('setup-vehicles')
  public setupVehicles(@Body() dto: SetupVehiclesDto) {
    return this.vehicleService.setupVehicles(dto.codes);
  }
}

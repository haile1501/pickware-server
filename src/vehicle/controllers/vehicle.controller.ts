import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { SetupVehiclesDto } from '../dtos/setup-vehicles.dto';
import { UpdatePickProgressDto } from '../dtos/update-pick-progress.dto';

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

  @Post('update-pick-progress')
  public updatePickProgress(@Body() dto: UpdatePickProgressDto) {
    return this.vehicleService.updatePickProgress(dto);
  }

  @Post('finish-job/:jobId')
  public finishJob(@Param('jobId') jobId: string) {
    return this.vehicleService.finishJob(jobId);
  }
}

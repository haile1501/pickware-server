import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { SetupVehiclesDto } from '../dtos/setup-vehicles.dto';
import { UpdatePickProgressDto } from '../dtos/update-pick-progress.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('upload-vehicles')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadVehicles(@UploadedFile() file: Express.Multer.File) {
    const vehicles = JSON.parse(file.buffer.toString());
    return this.vehicleService.uploadVehicles(vehicles);
  }

  @Post('update-pick-progress')
  public updatePickProgress(@Body() dto: UpdatePickProgressDto) {
    return this.vehicleService.updatePickProgress(dto);
  }

  @Post('finish-job/:vehicleCode')
  public finishJob(@Param('vehicleCode') vehicleCode: string) {
    return this.vehicleService.finishJob(vehicleCode);
  }
}

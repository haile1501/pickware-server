import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { JobRepository } from '../repositories/job.repository';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  public list() {
    return this.vehicleRepository.list();
  }

  public async clearVehicleAndJob() {
    await this.vehicleRepository.clearAll();
    await this.jobRepository.clearAll();
  }
}

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

  public async getVehiclesWithJob() {
    // Fetch all vehicles
    const vehicles = await this.vehicleRepository.list();

    // Extract vehicle IDs
    const vehicleIds = vehicles.map((vehicle) => vehicle.id);

    // Fetch jobs corresponding to the vehicle IDs
    const jobs =
      await this.jobRepository.getProcessingJobByVehicleIds(vehicleIds);

    // Map jobs to their corresponding vehicles
    const vehiclesWithJobs = vehicles.map((vehicle) => {
      const job = jobs.find((job) => job.vehicleId === vehicle.id);
      return {
        ...vehicle.toJSON(),
        job: job || null, // If no job is found, set it to null
      };
    });

    return vehiclesWithJobs;
  }

  public setupVehicles(codes: string[]) {
    return this.vehicleRepository.setupVehicles(codes);
  }
}

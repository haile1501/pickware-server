import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { JobRepository } from '../repositories/job.repository';
import { WarehouseService } from 'src/warehouse/services/warehouse.service';
import { CreateJob } from '../models/create-job.model';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly jobRepository: JobRepository,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
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
    const vehicleCodes = vehicles.map((vehicle) => vehicle.code);

    // Fetch jobs corresponding to the vehicle IDs
    const jobs =
      await this.jobRepository.getProcessingJobByVehicleCodes(vehicleCodes);

    // Map jobs to their corresponding vehicles
    const vehiclesWithJobs = vehicles.map((vehicle) => {
      const job = jobs.find((job) => job.vehicleCode === vehicle.code);
      return {
        ...vehicle.toJSON(),
        job: job || null, // If no job is found, set it to null
      };
    });

    return vehiclesWithJobs;
  }

  public async setupVehicles(codes: string[]) {
    const layout = await this.warehouseService.getLayout();
    const startPos = layout.vehicleStartPos;
    return this.vehicleRepository.setupVehicles(
      codes.map((code, index) => ({
        code,
        startPos: { y: startPos.y, x: startPos.x + index },
      })),
    );
  }

  public async createJobs(jobs: CreateJob[]) {
    return await this.jobRepository.createJobs(jobs);
  }
}

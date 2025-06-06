import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { JobRepository } from '../repositories/job.repository';
import { WarehouseService } from 'src/warehouse/services/warehouse.service';
import { CreateJob } from '../models/create-job.model';
import { UpdatePickProgressDto } from '../dtos/update-pick-progress.dto';
import { OrderService } from 'src/order/services/order.service';
import { JobStatusEnum } from '../constants/job-status.enum';
import { VehicleDto } from '../dtos/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly jobRepository: JobRepository,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  public list() {
    return this.vehicleRepository.list();
  }

  public async clearJobs() {
    await this.jobRepository.clearJobs();
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

  public async uploadVehicles(vehicles: VehicleDto[]) {
    await this.jobRepository.clearAll();
    await this.orderService.clearJobPreview();
    return this.vehicleRepository.uploadVehicles(vehicles);
  }

  public async createJobs(jobs: CreateJob[]) {
    await this.vehicleRepository.startPicking();
    return await this.jobRepository.createJobs(jobs);
  }

  public async updatePickProgress(dto: UpdatePickProgressDto) {
    const { vehicleCode, cartonId } = dto;
    const job =
      await this.jobRepository.getProcessingJobByVehicleCode(vehicleCode);
    if (!job) return null;

    // Update the isPicked field for the specified carton
    const updatedCartons = job.cartons.map((carton) =>
      carton.id === cartonId ? { ...carton, isPicked: true } : carton,
    );

    // Save the updated cartons array back to the job
    await this.jobRepository.updateCartonsByJobId(
      job._id.toString(),
      updatedCartons,
    );

    return { success: true };
  }

  public async finishJob(vehicleCode: string) {
    const job = await this.jobRepository.finishJob(vehicleCode);
    await this.vehicleRepository.finishJob(job.vehicleCode);
    const jobs = await this.jobRepository.getAllJobsByWaveId(job.waveId);

    // Check if all jobs in the wave are fulfilled (all cartons arePicked)
    const allFulfilled = jobs.every(
      (j) => j.status === JobStatusEnum.Fulfilled,
    );

    if (allFulfilled) {
      // Finish the wave if all jobs are fulfilled
      await this.orderService.finishWave(job.waveId);
    }
  }
}

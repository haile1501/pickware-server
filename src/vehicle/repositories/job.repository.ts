import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDoc } from '../schemas/job.schema';
import { JobStatusEnum } from '../constants/job-status.enum';
import { CreateJob } from '../models/create-job.model';

@Injectable()
export class JobRepository {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDoc>,
  ) {}

  public clearAll() {
    return this.jobModel.deleteMany();
  }

  public getProcessingJobByVehicleId(vehicleId: string) {
    return this.jobModel.findOne({
      vehicleId,
      status: JobStatusEnum.Processing,
    });
  }

  public getProcessingJobByVehicleCodes(vehicleCodes: string[]) {
    return this.jobModel.find({
      vehicleCode: { $in: vehicleCodes },
      status: JobStatusEnum.Processing,
    });
  }

  public createJobs(jobs: CreateJob[]) {
    return this.jobModel.insertMany(jobs);
  }

  public getProcessingJobByVehicleCode(vehicleCode: string) {
    return this.jobModel.findOne({
      vehicleCode,
      status: JobStatusEnum.Processing,
    });
  }

  public async updateCartonsByJobId(jobId: string, cartons: any[]) {
    return this.jobModel.updateOne({ _id: jobId }, { $set: { cartons } });
  }

  public async finishJob(vehicleCode: string) {
    return this.jobModel.findOneAndUpdate(
      { vehicleCode },
      {
        status: JobStatusEnum.Fulfilled,
      },
    );
  }

  public async getAllJobsByWaveId(waveId: string) {
    return await this.jobModel.find({ waveId });
  }
}

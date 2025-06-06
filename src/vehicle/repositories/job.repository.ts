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

  public getProcessingJobByVehicleCodes(vehicleCodes: string[]) {
    return this.jobModel.find({
      vehicleCode: { $in: vehicleCodes },
      status: JobStatusEnum.Processing,
      isActive: true,
    });
  }

  public async createJobs(jobs: CreateJob[]) {
    await this.jobModel.updateMany({}, { isActive: false });
    return this.jobModel.insertMany(jobs);
  }

  public getProcessingJobByVehicleCode(vehicleCode: string) {
    return this.jobModel.findOne({
      vehicleCode,
      status: JobStatusEnum.Processing,
      isActive: true,
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

  public async clearJobs() {
    return await this.jobModel.deleteMany();
  }
}

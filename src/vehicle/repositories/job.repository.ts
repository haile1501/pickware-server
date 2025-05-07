import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDoc } from '../schemas/job.schema';
import { JobStatusEnum } from '../constants/job-status.enum';

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

  public getProcessingJobByVehicleIds(vehicleIds: string[]) {
    return this.jobModel.find({
      vehicleId: { $in: vehicleIds },
      status: JobStatusEnum.Processing,
    });
  }
}

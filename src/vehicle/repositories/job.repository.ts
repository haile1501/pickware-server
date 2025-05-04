import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDoc } from '../schemas/job.schema';

@Injectable()
export class JobRepository {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDoc>,
  ) {}
}

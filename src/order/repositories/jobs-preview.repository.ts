import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobsPreview, JobsPreviewDoc } from '../schemas/jobs-preview.schema';
import { Model } from 'mongoose';

@Injectable()
export class JobsPreviewRepository {
  constructor(
    @InjectModel(JobsPreview.name)
    private readonly jobsPreviewModel: Model<JobsPreviewDoc>,
  ) {}

  public save(jobsPreview: JobsPreview) {
    return this.jobsPreviewModel.create(jobsPreview);
  }

  public getActive() {
    return this.jobsPreviewModel.findOne({ active: true });
  }
}

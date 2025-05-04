import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobStatusEnum } from '../constants/job-status.enum';

export type JobDoc = Job & Document;

@Schema({ _id: false })
class Carton {
  @Prop({ type: String, required: true })
  cartonId: string;

  @Prop({ type: Boolean, default: false })
  isPicked: boolean;
}

@Schema({
  collection: 'vehicle',
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Job {
  @Prop({ type: String, required: true })
  waveId: string;

  @Prop({ type: String, required: true })
  vehicleId: string;

  @Prop({
    type: String,
    enum: [JobStatusEnum.Processing, JobStatusEnum.Fulfilled],
  })
  status: JobStatusEnum;

  @Prop({ type: Array, default: [] })
  cartons: Carton[];
}

export const JobSchema = SchemaFactory.createForClass(Job);

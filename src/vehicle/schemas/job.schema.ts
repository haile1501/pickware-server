import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobStatusEnum } from '../constants/job-status.enum';
import { Action } from '../constants/action.enum';
import { Document } from 'mongoose';

export type JobDoc = Job & Document;

@Schema({ _id: false })
export class Carton {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Boolean, default: false })
  isPicked: boolean;
}

@Schema({ _id: false })
export class Step {
  @Prop({ type: Object, required: true })
  coordinate: { x: number; y: number };

  @Prop({ type: Action, required: true })
  action: Action;

  @Prop({ type: Object })
  pickPos: { x: number; y: number };
}

@Schema({
  collection: 'job',
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
  vehicleCode: string;

  @Prop({
    type: String,
    enum: [JobStatusEnum.Processing, JobStatusEnum.Fulfilled],
    default: JobStatusEnum.Processing,
  })
  status: JobStatusEnum;

  @Prop({ type: Array, default: [] })
  cartons: Carton[];

  @Prop({ type: Array, default: [] })
  steps: Step[];
}

export const JobSchema = SchemaFactory.createForClass(Job);

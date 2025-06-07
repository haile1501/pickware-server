import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Carton } from '../../algorithm/models/carton';
import { Conflict, Step } from 'src/vehicle/schemas/job.schema';

export type JobsPreviewDoc = JobsPreview & Document;

@Schema({
  _id: false,
})
export class Job {
  @Prop({ type: String, required: true })
  vehicleCode: string;

  @Prop({ type: Array, default: [] })
  cartons: Carton[];

  @Prop({ type: Array, default: [] })
  steps: Step[];

  @Prop({ type: [Array], default: [] })
  conflicts: Conflict[][];
}

@Schema({
  _id: false,
})
export class AlgoDetail {
  @Prop({ type: String, required: true })
  algoName: string;

  @Prop({ type: Number, default: 0 })
  estimatedPickingTime: number;

  @Prop({ type: Number, default: 0 })
  estimatedVehiclesStoppingTime: number;

  @Prop({ type: Number, default: 0 })
  idleSteps: number;

  @Prop({ type: Number, default: 0 })
  totalPathLength: number;

  @Prop({ type: Number, default: 0 })
  averagePathLength: number;

  @Prop({ type: Array, default: [] })
  jobs: Job[];

  @Prop({ type: Number, default: 0 })
  conflictsResolved: number;

  @Prop({ type: Number, default: 0 })
  totalConstraintsAdded: number;
}

@Schema({
  _id: false,
})
export class WithoutCollisionHandlingData {
  @Prop({ type: Number, required: true })
  estimatedPickingTime: number;

  @Prop({ type: Number, default: 0 })
  totalPathLength: number;

  @Prop({ type: Number, default: 0 })
  averagePathLength: number;
}

@Schema({
  collection: 'jobs-preview',
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
export class JobsPreview {
  @Prop({ type: String, required: true })
  waveId: string;

  @Prop({ type: Object, required: true })
  withoutCollisionHandlingData: WithoutCollisionHandlingData;

  @Prop({ type: Array, default: [] })
  algoDetails: AlgoDetail[];

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const JobsPreviewSchema = SchemaFactory.createForClass(JobsPreview);

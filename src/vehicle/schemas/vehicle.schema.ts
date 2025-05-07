import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VehicleStatusEnum } from '../constants/vehicle-status.enum';

export type VehicleDoc = Vehicle & Document;

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
export class Vehicle {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({
    type: String,
    enum: [VehicleStatusEnum.Available, VehicleStatusEnum.Picking],
    default: VehicleStatusEnum.Available,
  })
  status: VehicleStatusEnum;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LayoutDoc = Layout & Document;

@Schema({
  collection: 'layout',
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
export class Layout {
  @Prop({ type: [[String]], required: true })
  matrix: string[][];

  @Prop({ type: Object, required: true })
  vehicleStartPos: { x: number; y: number };

  @Prop({ type: Object, required: true })
  vehicleDropPos: { x: number; y: number };

  @Prop({ type: Number, default: 0 })
  vehicleCellMovingTime: number;

  @Prop({ type: Number, default: 0 })
  vehiclePickingTime: number;
}

export const LayoutSchema = SchemaFactory.createForClass(Layout);

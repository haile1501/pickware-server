import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
  @Prop({ type: [[Number]], required: true })
  matrix: number[][];
}

export const LayoutSchema = SchemaFactory.createForClass(Layout);

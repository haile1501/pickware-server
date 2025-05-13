import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CartonDoc = Carton & Document;

@Schema({
  _id: false,
})
export class Coordinate {
  x: number;
  y: number;
  z: number;
}

@Schema({
  collection: 'carton',
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
export class Carton {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  blockOrder: number;

  @Prop({ type: Number, required: true })
  shelfOrder: number;

  @Prop({ type: Number, required: true })
  cellOrder: number;

  @Prop({ type: Number, required: true })
  cellLevel: number;

  @Prop({ type: Coordinate, required: true })
  coordinate: Coordinate;
}

export const CartonSchema = SchemaFactory.createForClass(Carton);

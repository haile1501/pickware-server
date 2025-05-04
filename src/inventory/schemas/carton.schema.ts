import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CartonDoc = Carton & Document;

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

  @Prop({ type: String, required: true })
  blockId: string;

  @Prop({ type: Number, required: true })
  shelfOrder: number;

  @Prop({ type: Number, required: true })
  cellOrder: number;
}

export const CartonSchema = SchemaFactory.createForClass(Carton);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductDoc = Product & Document;

@Schema({
  collection: 'product',
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
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, required: true })
  sku: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

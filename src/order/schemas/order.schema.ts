import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatusEnum } from '../constants/order-status.enum';

export type OrderDoc = Order & Document;

@Schema({
  _id: false,
})
export class Orderline {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: Number, required: true })
  quantity: number;
}

@Schema({
  collection: 'order',
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
export class Order {
  @Prop({ type: Date, required: true })
  arrivalTime: Date;

  @Prop({
    type: String,
    enum: [
      OrderStatusEnum.Processing,
      OrderStatusEnum.Fulfilled,
      OrderStatusEnum.Pending,
    ],
  })
  status: OrderStatusEnum;

  @Prop({ type: String, default: null })
  waveId: string | null;

  @Prop({ type: Array, default: [] })
  orderlines: Orderline[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

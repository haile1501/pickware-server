import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ShelfDoc = Shelf & Document;

@Schema({
  collection: 'shelf',
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
export class Shelf {
  @Prop({ type: String, required: true })
  blockId: string;

  @Prop({ type: Number, required: true })
  shelfOrder: number;

  @Prop({ type: Number, required: true })
  numberOfCell: string;

  @Prop({ type: [Number], required: true })
  cellLevels: number[];
}

export const ShelfSchema = SchemaFactory.createForClass(Shelf);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlockDirection } from '../constants/block-direction.enum';

export type BlockDoc = Block & Document;

@Schema({
  collection: 'block',
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
export class Block {
  @Prop({ type: Number, required: true })
  rootXCoordinate: number;

  @Prop({ type: Number, required: true })
  rootYCoordinate: number;

  @Prop({
    type: String,
    enum: [BlockDirection.Horizontal, BlockDirection.Vertical],
  })
  direction: BlockDirection;

  @Prop({ type: Number, required: true })
  numberOfShelf: number;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

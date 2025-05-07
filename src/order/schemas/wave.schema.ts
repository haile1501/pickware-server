import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { WaveStatusEnum } from '../constants/wave-status.enum';

export type WaveDoc = Wave & Document;

@Schema({
  collection: 'wave',
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
export class Wave {
  @Prop({ type: Number, required: true })
  numberOfOrder: number;

  @Prop({
    type: String,
    enum: [WaveStatusEnum.Processing, WaveStatusEnum.Fulfilled],
    default: WaveStatusEnum.Processing,
  })
  status: WaveStatusEnum;
}

export const WaveSchema = SchemaFactory.createForClass(Wave);

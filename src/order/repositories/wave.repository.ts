import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wave, WaveDoc } from '../schemas/wave.schema';
import { WaveStatusEnum } from '../constants/wave-status.enum';

@Injectable()
export class WaveRepository {
  constructor(
    @InjectModel(Wave.name)
    private readonly waveModel: Model<WaveDoc>,
  ) {}

  public clearAll() {
    return this.waveModel.deleteMany();
  }

  public createWave(numberOfOrder: number) {
    return this.waveModel.create({ numberOfOrder });
  }

  public finishWave(waveId: string) {
    return this.waveModel.updateOne(
      { _id: waveId },
      { status: WaveStatusEnum.Fulfilled },
    );
  }
}

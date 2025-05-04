import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wave, WaveDoc } from '../schemas/wave.schema';

@Injectable()
export class WaveRepository {
  constructor(
    @InjectModel(Wave.name)
    private readonly waveModel: Model<WaveDoc>,
  ) {}
}

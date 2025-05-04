import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Carton, CartonDoc } from '../schemas/carton.schema';

@Injectable()
export class CartonRepository {
  constructor(
    @InjectModel(Carton.name)
    private readonly cartonModel: Model<CartonDoc>,
  ) {}
}

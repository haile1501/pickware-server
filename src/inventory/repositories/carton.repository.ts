import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Carton, CartonDoc } from '../schemas/carton.schema';
import { CreateCartonModel } from '../models/create-carton.model';

@Injectable()
export class CartonRepository {
  constructor(
    @InjectModel(Carton.name)
    private readonly cartonModel: Model<CartonDoc>,
  ) {}

  public importCartons(data: CreateCartonModel[]) {
    return this.cartonModel.insertMany(data);
  }

  public create(carton: CreateCartonModel) {
    return this.cartonModel.create(carton);
  }

  public async clearAll() {
    return this.cartonModel.deleteMany();
  }

  public getAllCartons() {
    return this.cartonModel.find();
  }

  public getProductCartons(sku: string) {
    return this.cartonModel.find({ sku });
  }
}

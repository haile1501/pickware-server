import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDoc } from '../schemas/vehicle.schema';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDoc>,
  ) {}

  public list() {
    return this.vehicleModel.find();
  }

  public clearAll() {
    return this.vehicleModel.deleteMany();
  }

  public setupVehicles(
    data: { code: string; startPos: { x: number; y: number } }[],
  ) {
    return this.vehicleModel.insertMany(data);
  }
}

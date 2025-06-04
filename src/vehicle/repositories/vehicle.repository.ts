import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDoc } from '../schemas/vehicle.schema';
import { VehicleStatusEnum } from '../constants/vehicle-status.enum';
import { VehicleDto } from '../dtos/vehicle.dto';

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

  public startPicking() {
    return this.vehicleModel.updateMany(
      { status: VehicleStatusEnum.Available },
      { $set: { status: VehicleStatusEnum.Picking } },
    );
  }

  public finishJob(vehicleCode: string) {
    return this.vehicleModel.updateOne(
      { code: vehicleCode },
      { $set: { status: VehicleStatusEnum.Available } },
    );
  }

  public async uploadVehicles(vehicles: VehicleDto[]) {
    await this.vehicleModel.deleteMany();
    return await this.vehicleModel.insertMany(vehicles);
  }
}

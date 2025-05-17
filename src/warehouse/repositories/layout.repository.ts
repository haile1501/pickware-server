import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Layout, LayoutDoc } from '../schemas/layout.schema';
import { XyCoordinate } from 'src/common/models/xy-coordinate.model';

@Injectable()
export class LayoutRepository {
  constructor(
    @InjectModel(Layout.name)
    private readonly layoutModel: Model<LayoutDoc>,
  ) {}

  public get() {
    return this.layoutModel.findOne();
  }

  public save(
    matrix: string[][],
    vehicleStartPos: XyCoordinate,
    vehicleDropPos: XyCoordinate,
  ) {
    return this.layoutModel.insertOne({
      matrix,
      vehicleStartPos,
      vehicleDropPos,
    });
  }

  public clear() {
    return this.layoutModel.deleteMany();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Layout, LayoutDoc } from '../schemas/layout.schema';

@Injectable()
export class LayoutRepository {
  constructor(
    @InjectModel(Layout.name)
    private readonly layoutModel: Model<LayoutDoc>,
  ) {}

  public get() {
    return this.layoutModel.findOne();
  }
}

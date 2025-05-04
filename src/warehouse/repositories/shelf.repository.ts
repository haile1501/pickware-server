import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shelf, ShelfDoc } from '../schemas/shelf.schema';

@Injectable()
export class ShelfRepository {
  constructor(
    @InjectModel(Shelf.name)
    private readonly shelfModel: Model<ShelfDoc>,
  ) {}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block, BlockDoc } from '../schemas/block.schema';

@Injectable()
export class BlockRepository {
  constructor(
    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDoc>,
  ) {}
}

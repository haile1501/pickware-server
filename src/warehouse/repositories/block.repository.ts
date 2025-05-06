import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block, BlockDoc } from '../schemas/block.schema';
import { SetupBlocksDto } from '../dtos/setup-blocks.dto';

@Injectable()
export class BlockRepository {
  constructor(
    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDoc>,
  ) {}

  public setUpBlocks(setupBlocksDto: SetupBlocksDto) {
    return this.blockModel.insertMany(setupBlocksDto.blocks);
  }

  public clearBlock() {
    return this.blockModel.deleteMany();
  }

  public getBlocks() {
    return this.blockModel.find();
  }
}

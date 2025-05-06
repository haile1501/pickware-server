import {
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockDirection } from '../constants/block-direction.enum';

export class BlockDto {
  @IsInt()
  rootXCoordinate: number;

  @IsInt()
  rootYCoordinate: number;

  @IsEnum(BlockDirection)
  direction: BlockDirection;

  @IsInt()
  numberOfShelf: number;

  @IsInt()
  blockOrder: number;
}

export class SetupBlocksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks: BlockDto[];
}

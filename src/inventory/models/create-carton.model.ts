import { Coordinate } from '../schemas/carton.schema';

export class CreateCartonModel {
  sku: string;
  quantity: number;
  blockOrder: number;
  shelfOrder: number;
  cellOrder: number;
  cellLevel: number;
  coordinate: Coordinate;
}

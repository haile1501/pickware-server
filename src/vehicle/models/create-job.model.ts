import { XyCoordinate } from 'src/common/models/xy-coordinate.model';
import { Action } from '../constants/action.enum';

export class CreateJob {
  waveId: string;
  vehicleCode: string;
  cartons: { id: string }[];
  steps: {
    coordinate: XyCoordinate;
    action: Action;
    pickPos?: XyCoordinate;
  }[];
}

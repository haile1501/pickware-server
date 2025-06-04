import { XyCoordinate } from 'src/common/models/xy-coordinate.model';
import { Job } from './job';

export type VehicleWithJob = {
  code: string;
  start: XyCoordinate;
  drop: XyCoordinate;
  job: Job;
};

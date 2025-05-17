import { Job } from './job';

export type VehicleWithPath = {
  code: string;
  job: Job;
  path: {
    x: number;
    y: number;
    action: 'move' | 'stop' | 'pick' | 'drop';
  }[];
};

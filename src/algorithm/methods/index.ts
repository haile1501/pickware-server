import kMeans from './k-means';
import { CA } from './cooperative-a-star';
import { XyCoordinate } from 'src/common/models/xy-coordinate.model';
import { optimizeJob } from './nn-2opt';
import { runCBS } from './conflict-based-search';
import { Carton } from '../models/carton';

export const generateJob = (
  cartons: Carton[],
  vehicles: {
    startPos: XyCoordinate;
    code: string;
  }[],
  dropPos: XyCoordinate,
  grid: string[][],
  algorithm: string,
) => {
  // 1. Cluster cartons for each vehicle
  const jobs = kMeans(cartons, vehicles.length);

  // 2. Sequence cartons for each cluster (job)
  const optimizedJobs = jobs.map((job, index) =>
    optimizeJob(job, vehicles[index].startPos, dropPos),
  );

  // 3. Build Vehicle objects
  const vehiclesWithJob = optimizedJobs.map((job, idx) => ({
    code: vehicles[idx].code,
    start: vehicles[idx].startPos,
    drop: dropPos,
    job,
    path: [],
  }));

  // 4. Generate collision-free paths for each vehicle
  const vehiclesWithPaths =
    algorithm === 'ca'
      ? CA(grid, [...vehiclesWithJob]).vehicles
      : runCBS(grid, [...vehiclesWithJob]);

  return vehiclesWithPaths;

  // 5. Return in VehicleWithPath format
  //   return vehiclesWithPaths.map((v) => ({
  //     code: v.code,
  //     job: v.job,
  //     path: v.path,
  //     cartons: v.job.cartons,
  //   }));
  // };
};

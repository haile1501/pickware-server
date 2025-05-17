import kMeans from './k-means';
import { planAllPaths, Vehicle } from './cooperative-a-star';
import { Carton } from './models/carton';
import { XyCoordinate } from 'src/common/models/xy-coordinate.model';
import { optimizeJob } from './nn-2opt';

export const generateJob = (
  cartons: Carton[],
  vehicles: {
    startPos: XyCoordinate;
    code: string;
  }[],
  dropPos: XyCoordinate,
  grid: string[][],
) => {
  // 1. Cluster cartons for each vehicle
  const jobs = kMeans(cartons, vehicles.length);

  // 2. Sequence cartons for each cluster (job)
  const optimizedJobs = jobs.map((job, index) =>
    optimizeJob(job, vehicles[index].startPos, dropPos),
  );

  // 3. Build Vehicle objects
  const vehiclesWithJob: Vehicle[] = optimizedJobs.map((job, idx) => ({
    code: vehicles[idx].code,
    start: vehicles[idx].startPos,
    drop: dropPos,
    job,
    path: [],
  }));

  // 4. Generate collision-free paths for each vehicle
  const vehiclesWithPaths = planAllPaths(grid, [...vehiclesWithJob]);

  // 5. Return in VehicleWithPath format
  return vehiclesWithPaths.map((v) => ({
    code: v.code,
    job: v.job,
    path: v.path,
    cartons: v.job.cartons,
  }));
};

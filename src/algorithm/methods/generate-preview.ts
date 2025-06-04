import { XyCoordinate } from 'src/common/models/xy-coordinate.model';
import { Carton } from '../models/carton';
import kMeans from './k-means';
import { optimizeJob } from './nn-2opt';
import {
  generateNoConflictAvoidancePlan,
  Step,
} from './generate-no-conflict-avoidance';
import { CA } from './cooperative-a-star';

export const generatePreviewPlan = (
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
  const vehiclesWithJob = optimizedJobs.map((job, idx) => ({
    code: vehicles[idx].code,
    start: vehicles[idx].startPos,
    drop: dropPos,
    job,
    path: [],
  }));

  const noConflictAvoidanceResult = generateNoConflictAvoidancePlan(
    vehiclesWithJob,
    grid,
  );

  const cooperativeAStarResult = CA(grid, vehiclesWithJob);

  return {
    noConflictResult: {
      ...calculateMetrics(noConflictAvoidanceResult),
      // noConflictAvoidanceResult,
      conflictsToResolve: detectConflictsFromPaths(noConflictAvoidanceResult),
    },
    cooperativeAStarResult: {
      metrics: cooperativeAStarResult.metrics,
      vehicles: cooperativeAStarResult.vehicles,
    },
    cbsResult: {
      metrics: cooperativeAStarResult.metrics,
      vehicles: cooperativeAStarResult.vehicles,
    },
  };
};

function calculateMetrics(
  noConflictAvoidanceResult: { code: string; path: Step[] }[],
) {
  let estimatedPickingTime = 0;
  let totalPathLength = 0;
  const pathLengths: number[] = [];

  for (const vehicle of noConflictAvoidanceResult) {
    if (!vehicle.path.length) continue;
    if (vehicle.path.length > estimatedPickingTime) {
      estimatedPickingTime = vehicle.path.length;
    }

    const pathLength = vehicle.path.filter(
      (step) => step.action === 'move',
    ).length;
    totalPathLength += pathLength;
    pathLengths.push(pathLength);
  }

  const averagePathLength =
    pathLengths.length > 0
      ? pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length
      : 0;

  return {
    estimatedPickingTime,
    totalPathLength,
    averagePathLength,
  };
}

export function detectConflictsFromPaths(
  avoidanceResult: { code: string; path: Step[] }[],
): { codes: string[]; t: number; x: number; y: number }[] {
  const conflicts: { codes: string[]; t: number; x: number; y: number }[] = [];
  const occupancy = new Map<string, string[]>();

  // Build occupancy map
  for (const vehicle of avoidanceResult) {
    for (const step of vehicle.path) {
      const key = `${step.x},${step.y},${step.t}`;
      if (!occupancy.has(key)) occupancy.set(key, []);
      occupancy.get(key)!.push(vehicle.code);
    }
  }

  // Find conflicts
  for (const [key, codes] of occupancy.entries()) {
    if (codes.length > 1) {
      const [x, y, t] = key.split(',').map(Number);
      conflicts.push({ codes, t, x, y });
    }
  }

  // Sort conflicts by t ascending
  conflicts.sort((c1, c2) => c1.t - c2.t);

  return conflicts;
}

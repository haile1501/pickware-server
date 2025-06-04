import { Carton } from '../models/carton';
import { Job } from '../models/job';

type Pos = { x: number; y: number };

const manhattan = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function nearestNeighbor(cartons: Carton[], start: Pos, drop: Pos): Carton[] {
  const remaining = [...cartons];
  const ordered: Carton[] = [];
  let current = start;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = manhattan(current, remaining[i].coordinate);
      if (d < minDist) {
        minDist = d;
        nearestIndex = i;
      }
    }

    const next = remaining.splice(nearestIndex, 1)[0];
    ordered.push(next);
    current = drop; // luôn quay về drop sau mỗi lần pick
  }

  return ordered;
}

function calculateRouteDistance(
  cartons: Carton[],
  start: Pos,
  drop: Pos,
): number {
  if (cartons.length === 0) return 0;
  let total = 0;
  let current = start;
  for (const carton of cartons) {
    total += manhattan(current, carton.coordinate);
    total += manhattan(carton.coordinate, drop);
    current = drop;
  }
  return total;
}

function twoOpt(cartons: Carton[], start: Pos, drop: Pos): Carton[] {
  if (cartons.length <= 1) return cartons;
  let best = [...cartons];
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const newRoute = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        const oldDist = calculateRouteDistance(best, start, drop);
        const newDist = calculateRouteDistance(newRoute, start, drop);

        if (newDist < oldDist) {
          best = newRoute;
          improved = true;
        }
      }
    }
  }
  return best;
}

export function optimizeJob(job: Job, start: Pos, drop: Pos): Job {
  if (!job.cartons || job.cartons.length === 0) return { cartons: [] };
  const nnOrder = nearestNeighbor(job.cartons, start, drop);
  const optimized = twoOpt(nnOrder, start, drop);
  return { cartons: optimized };
}

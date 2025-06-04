import { VehicleWithJob } from '../models/vehicle-with-job';
import { PriorityQueue } from './cooperative-a-star';
import { getPickPos } from './get-pick-pos';

type Pos = { x: number; y: number };
export type Step = Pos & {
  action: 'move' | 'stop' | 'pick' | 'drop';
  t: number;
} & {
  pickPos?: Pos;
  parent?: Step;
};

const heuristic = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const DIRS = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

export function aStar(
  grid: string[][],
  start: Pos & { t: number },
  goal: Pos,
  action: 'move' | 'stop' | 'pick' | 'drop',
): Step[] | null {
  const open = new PriorityQueue<Step>();
  open.enqueue({ ...start, action }, heuristic(start, goal));
  const closed = new Set<string>();

  while (open.length) {
    const current = open.dequeue()!;
    const key = `${current.x},${current.y}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Step[] = [];
      let temp: Step | undefined = current;
      while (temp) {
        path.unshift({ ...temp, parent: null });
        temp = temp.parent;
      }
      return path;
    }

    for (const dir of DIRS) {
      const next: Pos = { x: current.x + dir.x, y: current.y + dir.y };
      const nt = current.t + 1;
      if (
        next.x < 0 ||
        next.y < 0 ||
        next.x >= grid[0].length ||
        next.y >= grid.length ||
        grid[next.y][next.x] === '8'
      )
        continue;

      const nextStep: Step = {
        ...next,
        t: nt,
        action: 'move',
        parent: current,
      };
      open.enqueue(nextStep, heuristic(next, goal));
    }
  }
  return null;
}

export const generateNoConflictAvoidancePlan = (
  vehicles: VehicleWithJob[],
  grid: string[][],
): { code: string; path: Step[] }[] => {
  return vehicles.map((vehicle) => {
    let path: Step[] = [];
    let current = { x: vehicle.start.x, y: vehicle.start.y };
    let t = 0;

    for (const carton of vehicle.job.cartons) {
      // Path to carton
      const toCarton = aStar(
        grid,
        { ...current, t: t + 1 },
        getPickPos(carton),
        'move',
      );

      if (toCarton) {
        path = path.concat(toCarton);
        t = toCarton[toCarton.length - 1].t;
        current = getPickPos(carton);
        // Add pick step
        path.push({
          ...current,
          t: t + 1,
          action: 'pick',
          pickPos: getPickPos(carton),
          parent: toCarton[toCarton.length - 1],
        });
        t = t + 1;
      } else {
        throw new Error('No path to carton');
      }

      // Path to drop (if needed)
      if (vehicle.drop) {
        const toDrop = aStar(
          grid,
          { ...current, t: t + 1 },
          { x: vehicle.drop.x, y: vehicle.drop.y },
          'move',
        );
        if (toDrop) {
          path = path.concat(toDrop);
          t = toDrop[toDrop.length - 1].t;
          current = { x: vehicle.drop.x, y: vehicle.drop.y };
          // Add drop step
          path.push({
            ...current,
            t: t + 1,
            action: 'drop',
            parent: toDrop[toDrop.length - 1],
          });
          t = t + 1;
        } else {
          throw Error('No path to drop');
        }
      }
    }

    // Return to start position
    const toStart = aStar(
      grid,
      { ...current, t: t + 1 },
      { x: vehicle.start.x, y: vehicle.start.y },
      'move',
    );
    if (toStart) {
      path = path.concat(toStart);
    }

    return { code: vehicle.code, path };
  });
};

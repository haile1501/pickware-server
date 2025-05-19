import { getPickPos } from './get-pick-pos';
import { Job } from './models/job';
import { PriorityQueue } from './cooperative-a-star';
type Pos = { x: number; y: number };
type Step = Pos & { action: 'move' | 'stop' | 'pick' | 'drop'; t: number } & {
  pickPos?: Pos;
  parent?: Step;
};
export type Vehicle = {
  code: string;
  start: Pos;
  drop: Pos;
  job: Job;
  path: Step[];
};

export type Constraint = {
  x: number;
  y: number;
  t: number;
  vehicleCode: string;
};

export function manhattan(a: Pos, b: Pos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

const DIRS: Pos[] = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 0, y: 0 },
];

const heuristic = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function isConstrained(
  pos: Pos,
  t: number,
  vehicleCode: string,
  constraints: Constraint[],
): boolean {
  return constraints.some(
    (c) =>
      c.x === pos.x &&
      c.y === pos.y &&
      c.t === t &&
      c.vehicleCode !== vehicleCode,
  );
}

export function aStar(
  grid: string[][],
  start: Pos,
  goal: Pos,
  startTime: number,
  vehicleCode: string,
  constraints: Constraint[],
  action: 'move' | 'stop' | 'pick' | 'drop',
): Step[] | null {
  const open = new PriorityQueue<Step>();
  open.enqueue({ ...start, t: startTime, action }, heuristic(start, goal));
  const closed = new Set<string>();

  while (open.length) {
    const current = open.dequeue()!;
    const key = `${current.x},${current.y},${current.t}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Step[] = [];
      let temp: Step | undefined = current;
      while (temp) {
        path.unshift(temp);
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
        grid[next.y][next.x] === '8' ||
        isConstrained(next, nt, vehicleCode, constraints)
        // Removed: || nt > maxTime
      )
        continue;

      const nextStep: Step = {
        ...next,
        t: nt,
        action: 'move',
        parent: current,
      };
      open.enqueue(nextStep, nt + heuristic(next, goal));
    }
  }
  return null;
}

type CBSNode = {
  paths: Record<string, Step[]>;
  constraints: Constraint[];
};

function detectConflict(paths: Record<string, Step[]>): {
  a: string;
  b: string;
  x: number;
  y: number;
  t: number;
  edge?: boolean;
} | null {
  const map = new Map<string, string>();
  const maxT = Math.max(...Object.values(paths).map((p) => p[p.length - 1].t));
  for (let t = 0; t <= maxT; t++) {
    for (const [code, path] of Object.entries(paths)) {
      const step = path.find((s) => s.t === t) ?? path[path.length - 1];
      const key = `${step.x},${step.y},${t}`;
      if (map.has(key)) {
        return { a: map.get(key)!, b: code, x: step.x, y: step.y, t };
      }
      map.set(key, code);
    }
  }

  // Edge conflict check
  for (let t = 1; t <= maxT; t++) {
    for (const [codeA, pathA] of Object.entries(paths)) {
      const prevA = pathA.find((s) => s.t === t - 1) ?? pathA[pathA.length - 1];
      const currA = pathA.find((s) => s.t === t) ?? pathA[pathA.length - 1];
      for (const [codeB, pathB] of Object.entries(paths)) {
        if (codeA >= codeB) continue;
        const prevB =
          pathB.find((s) => s.t === t - 1) ?? pathB[pathB.length - 1];
        const currB = pathB.find((s) => s.t === t) ?? pathB[pathB.length - 1];
        if (
          prevA.x === currB.x &&
          prevA.y === currB.y &&
          prevB.x === currA.x &&
          prevB.y === currA.y
        ) {
          return { a: codeA, b: codeB, x: currA.x, y: currA.y, t, edge: true };
        }
      }
    }
  }

  return null;
}

export function runCBS(grid: string[][], vehicles: Vehicle[]): Vehicle[] {
  const root: CBSNode = {
    paths: {},
    constraints: [],
  };

  for (const v of vehicles) {
    const steps: Step[] = [];
    let t = 0;
    let current = v.start;

    for (const carton of v.job.cartons) {
      const toCarton = aStar(
        grid,
        current,
        getPickPos(carton),
        t,
        v.code,
        root.constraints,
        'move',
      );
      if (!toCarton) throw new Error(`No path to carton for ${v.code}`);
      steps.push(...toCarton);

      const toDrop = aStar(
        grid,
        carton.coordinate,
        v.drop,
        steps[steps.length - 1].t,
        v.code,
        root.constraints,
        'pick',
      );
      if (!toDrop) throw new Error(`No path to drop for ${v.code}`);
      steps.push(...toDrop);

      current = v.drop;
      t = steps[steps.length - 1].t;
    }

    const back = aStar(
      grid,
      current,
      v.start,
      t,
      v.code,
      root.constraints,
      'move',
    );
    if (!back) throw new Error(`No path back to start for ${v.code}`);
    steps.push(...back);

    root.paths[v.code] = steps;
  }

  const queue: CBSNode[] = [root];
  while (queue.length) {
    const node = queue.shift()!;
    const conflict = detectConflict(node.paths);
    if (!conflict) {
      return vehicles.map((v) => ({
        ...v,
        path: node.paths[v.code],
      }));
    }

    for (const agent of [conflict.a, conflict.b]) {
      const newConstraints = [
        ...node.constraints,
        { x: conflict.x, y: conflict.y, t: conflict.t, vehicleCode: agent },
      ];
      const newPaths = { ...node.paths };
      const vehicle = vehicles.find((v) => v.code === agent)!;

      const steps: Step[] = [];
      let t = 0;
      let current = vehicle.start;

      for (const carton of vehicle.job.cartons) {
        const toCarton = aStar(
          grid,
          current,
          getPickPos(carton),
          t,
          vehicle.code,
          newConstraints,
          'move',
        );
        if (!toCarton) continue;
        steps.push(...toCarton);

        const toDrop = aStar(
          grid,
          carton.coordinate,
          vehicle.drop,
          steps[steps.length - 1].t,
          vehicle.code,
          newConstraints,
          'pick',
        );
        if (!toDrop) continue;
        steps.push(...toDrop);

        current = vehicle.drop;
        t = steps[steps.length - 1].t;
      }

      const back = aStar(
        grid,
        current,
        vehicle.start,
        t,
        vehicle.code,
        newConstraints,
        'move',
      );
      if (!back) continue;
      steps.push(...back);

      newPaths[agent] = steps;
      queue.push({ paths: newPaths, constraints: newConstraints });
    }
  }

  throw new Error('No conflict-free solution found');
}

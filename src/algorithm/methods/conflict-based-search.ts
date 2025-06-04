import { Job } from '../models/job';
import { PriorityQueue } from './cooperative-a-star';
import { getPickPos } from './get-pick-pos';

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
      c.vehicleCode === vehicleCode,
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
      )
        continue;

      const nextStep: Step = {
        ...next,
        t: nt,
        action: dir.x === 0 && dir.y === 0 ? 'stop' : 'move',
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

export function runCBS(grid: string[][], vehicles: Vehicle[]) {
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
      steps.push({
        ...getPickPos(carton),
        action: 'pick',
        t: toCarton[toCarton.length - 1].t + 1,
        pickPos: carton.coordinate,
      });

      // const toDrop = aStar(
      //   grid,
      //   getPickPos(carton),
      //   v.drop,
      //   steps[steps.length - 1].t + 1,
      //   v.code,
      //   root.constraints,
      //   'move',
      // );
      // if (!toDrop) throw new Error(`No path to drop for ${v.code}`);
      // steps.push(...toDrop);
      // steps.push({
      //   ...v.drop,
      //   action: 'drop',
      //   t: toDrop[toDrop.length - 1].t + 1,
      // });

      // current = v.drop;
      current = getPickPos(carton);
      t = steps[steps.length - 1].t + 1;
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
  const visited = new Set<string>();
  while (queue.length) {
    const node = queue.shift()!;
    const nodeKey = JSON.stringify(node.constraints);
    if (visited.has(nodeKey)) continue;
    visited.add(nodeKey);

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
      let failed = false;

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
        if (!toCarton) {
          failed = true;
          break;
        }
        steps.push(...toCarton);
        steps.push({
          ...getPickPos(carton),
          action: 'pick',
          t: toCarton[toCarton.length - 1].t + 1,
          pickPos: carton.coordinate,
        });

        // const toDrop = aStar(
        //   grid,
        //   getPickPos(carton),
        //   vehicle.drop,
        //   steps[steps.length - 1].t + 1,
        //   vehicle.code,
        //   newConstraints,
        //   'move',
        // );
        // if (!toDrop) {
        //   failed = true;
        //   break;
        // }
        // steps.push(...toDrop);
        // steps.push({
        //   ...vehicle.drop,
        //   action: 'drop',
        //   t: toDrop[toDrop.length - 1].t + 1,
        // });

        // current = vehicle.drop;
        current = getPickPos(carton);
        t = steps[steps.length - 1].t + 1;
      }

      if (failed) continue;

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

// export function runCBSWindowed(
//   grid: string[][],
//   vehicles: Vehicle[],
//   windowSize: number = 20, // You can tune this
// ): Vehicle[] {
//   // Clone vehicles to avoid mutating input
//   const result: Vehicle[] = vehicles.map((v) => ({ ...v, path: [] }));
//   const activeVehicles = result.map((v) => ({
//     ...v,
//     current: v.start,
//     t: 0,
//     jobIndex: 0,
//     cartonIndex: 0,
//     done: false,
//   }));

//   while (activeVehicles.some((v) => !v.done)) {
//     // Prepare CBS root node for this window
//     const root: CBSNode = {
//       paths: {},
//       constraints: [],
//     };

//     // Plan for each vehicle for this window
//     for (const v of activeVehicles) {
//       if (v.done) continue;
//       const steps: Step[] = [];
//       let t = v.t;
//       let current = v.current;
//       const cartons = v.job.cartons.slice(v.cartonIndex);

//       // Plan for cartons in this window
//       for (const carton of cartons) {
//         const toCarton = aStar(
//           grid,
//           current,
//           getPickPos(carton),
//           t,
//           v.code,
//           root.constraints,
//           'move',
//         );
//         if (!toCarton) break;
//         steps.push(...toCarton);
//         steps.push({
//           ...getPickPos(carton),
//           action: 'pick',
//           t: toCarton[toCarton.length - 1].t + 1,
//           pickPos: carton.coordinate,
//         });

//         const toDrop = aStar(
//           grid,
//           getPickPos(carton),
//           v.drop,
//           steps[steps.length - 1].t,
//           v.code,
//           root.constraints,
//           'move',
//         );
//         if (!toDrop) break;
//         steps.push(...toDrop);
//         steps.push({
//           ...v.drop,
//           action: 'drop',
//           t: toDrop[toDrop.length - 1].t + 1,
//         });

//         current = v.drop;
//         t = steps[steps.length - 1].t;
//         if (steps.length >= windowSize) break;
//       }

//       // If not enough steps, plan to wait at current location
//       while (steps.length < windowSize) {
//         steps.push({
//           ...current,
//           t: t++,
//           action: 'stop',
//         });
//       }

//       // Only keep steps within window
//       root.paths[v.code] = steps.slice(0, windowSize);
//     }

//     // Run CBS for this window
//     const windowVehicles = activeVehicles.map((v) => ({
//       ...v,
//       path: [],
//     }));
//     const windowResult = runCBS(grid, windowVehicles);

//     // Update global paths and vehicle states
//     for (let i = 0; i < activeVehicles.length; i++) {
//       const v = activeVehicles[i];
//       if (v.done) continue;
//       const planned = windowResult.find((wv) => wv.code === v.code)!.path;
//       // Append planned steps to result
//       result[i].path.push(...planned);

//       // Update vehicle state for next window
//       const lastStep = planned[Math.min(windowSize - 1, planned.length - 1)];
//       v.current = { x: lastStep.x, y: lastStep.y };
//       v.t = lastStep.t + 1;

//       // Check if all cartons are done (simple check: if at start and all cartons delivered)
//       if (
//         v.cartonIndex >= v.job.cartons.length &&
//         v.current.x === v.start.x &&
//         v.current.y === v.start.y
//       ) {
//         v.done = true;
//       }
//     }
//   }

//   return result;
// }

import { Job } from '../models/job';
import { getPickPos } from './get-pick-pos';

type Pos = { x: number; y: number };
type Step = Pos & { action: 'move' | 'stop' | 'pick' | 'drop' } & {
  pickPos?: Pos;
};
type Constraint = { x: number; y: number; t: number };

// Add a new type for edge constraints
type EdgeConstraint = { from: Pos; to: Pos; t: number };

export type Vehicle = {
  code: string;
  start: Pos;
  drop: Pos;
  job: Job;
  path: Step[];
};

type Node = Pos & {
  t: number;
  g: number;
  f: number;
  action: 'move' | 'pick' | 'stop' | 'drop';
  parent?: Node;
  pickPos?: Pos;
};

const DIRS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 0], // Wait
];

const heuristic = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Simple binary heap priority queue for Node
export class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];
  enqueue(item: T, priority: number) {
    this.heap.push({ item, priority });
    this.bubbleUp();
  }
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0].item;
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown();
    }
    return top;
  }
  get length() {
    return this.heap.length;
  }
  private bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority >= this.heap[parentIdx].priority) break;
      [this.heap[idx], this.heap[parentIdx]] = [
        this.heap[parentIdx],
        this.heap[idx],
      ];
      idx = parentIdx;
    }
  }
  private bubbleDown() {
    let idx = 0;
    const length = this.heap.length;
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let smallest = idx;
      if (
        left < length &&
        this.heap[left].priority < this.heap[smallest].priority
      )
        smallest = left;
      if (
        right < length &&
        this.heap[right].priority < this.heap[smallest].priority
      )
        smallest = right;
      if (smallest === idx) break;
      [this.heap[idx], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[idx],
      ];
      idx = smallest;
    }
  }
}

// Update aStar to check for edge conflicts
function aStar(
  grid: string[][],
  start: Pos,
  goal: Pos,
  constraints: Constraint[],
  startTime: number,
  action: 'pick' | 'stop' | 'move' | 'drop' = 'move',
  edgeConstraints: EdgeConstraint[] = [],
): Node[] | null {
  if (grid[start.y][start.x] === '8') {
    console.log(1);
  }
  const open = new PriorityQueue<Node>();
  open.enqueue(
    { ...start, t: startTime, g: 0, f: heuristic(start, goal), action },
    heuristic(start, goal),
  );
  const closed = new Set<string>();
  const bestG = new Map<string, number>();

  // Constraint table for fast lookup
  const constraintTable = new Map<string, Set<number>>();
  constraints.forEach(({ x, y, t }) => {
    const key = `${x},${y}`;
    if (!constraintTable.has(key)) constraintTable.set(key, new Set());
    constraintTable.get(key)!.add(t);
  });

  // Edge constraint table for fast lookup
  const edgeConstraintTable = new Map<string, Set<string>>();
  edgeConstraints.forEach(({ from, to, t }) => {
    const key = `${from.x},${from.y},${to.x},${to.y},${t}`;
    edgeConstraintTable.set(key, new Set(['blocked']));
  });

  while (open.length) {
    const current = open.dequeue()!;

    const key = `${current.x},${current.y},${current.t}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Node[] = [];
      let temp: Node | undefined = current;
      while (temp) {
        path.unshift(temp);
        temp = temp.parent;
      }
      return path;
    }

    for (const [dx, dy] of DIRS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nt = current.t + 1;

      // Vertex constraint
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= grid[0].length ||
        ny >= grid.length ||
        grid[ny][nx] === '8' ||
        constraintTable.get(`${nx},${ny}`)?.has(nt)
      )
        continue;

      // Edge conflict check
      const edgeKey = `${current.x},${current.y},${nx},${ny},${nt}`;
      if (edgeConstraintTable.has(edgeKey)) continue;

      const nodeKey = `${nx},${ny},${nt}`;
      const newG = current.g + 1;
      if (bestG.has(nodeKey) && bestG.get(nodeKey)! <= newG) continue;
      bestG.set(nodeKey, newG);

      const node: Node = {
        x: nx,
        y: ny,
        t: nt,
        g: newG,
        f: newG + heuristic({ x: nx, y: ny }, goal),
        action: dx === 0 && dy === 0 ? 'stop' : 'move',
        parent: current,
      };
      open.enqueue(node, node.f);
    }
  }

  return null;
}

// Update buildPathSequence to collect edge constraints
function buildPathSequence(
  grid: string[][],
  vehicle: Vehicle,
  constraints: Constraint[],
  edgeConstraints: EdgeConstraint[],
): {
  path: Step[];
  constraints: Constraint[];
  edgeConstraints: EdgeConstraint[];
} {
  let time = 0;
  const sequence: Step[] = [];
  let current = vehicle.start;

  for (const carton of vehicle.job.cartons) {
    const pathToCarton = aStar(
      grid,
      current,
      getPickPos(carton),
      constraints,
      time,
      'move',
      edgeConstraints,
    );
    if (!pathToCarton) throw new Error('No path to carton');
    const pickStep: Node = {
      ...getPickPos(carton),
      t: pathToCarton[pathToCarton.length - 1].t + 1,
      g: 0,
      f: 0,
      action: 'pick',
      parent: pathToCarton[pathToCarton.length - 1],
      pickPos: carton.coordinate,
    };
    pathToCarton.push(pickStep);

    // Add vertex and edge constraints
    pathToCarton.forEach((n, i, arr) => {
      constraints.push({ x: n.x, y: n.y, t: n.t });
      if (n.action === 'pick') {
        constraints.push({ x: n.x, y: n.y, t: n.t + 1 });
      }
      if (i > 0) {
        edgeConstraints.push({
          from: { x: arr[i - 1].x, y: arr[i - 1].y },
          to: { x: n.x, y: n.y },
          t: n.t,
        });
        if (n.action === 'pick') {
          edgeConstraints.push({
            from: { x: arr[i - 1].x, y: arr[i - 1].y },
            to: { x: n.x, y: n.y },
            t: n.t + 1,
          });
        }
      }
    });
    sequence.push(
      ...pathToCarton.map((n) => ({
        x: n.x,
        y: n.y,
        action: n.action,
        pickPos: n.pickPos,
      })),
    );

    time = pickStep.t + 1;
    current = getPickPos(carton);

    const pathToDrop = aStar(
      grid,
      current,
      vehicle.drop,
      constraints,
      time,
      'move',
      edgeConstraints,
    );
    if (!pathToDrop) throw new Error('No path to drop');
    const dropStep: Node = {
      ...vehicle.drop,
      t: pathToDrop[pathToDrop.length - 1].t + 1,
      g: 0,
      f: 0,
      action: 'drop',
      parent: pathToDrop[pathToDrop.length - 1],
    };
    pathToDrop.push(dropStep);

    pathToDrop.forEach((n, i, arr) => {
      constraints.push({ x: n.x, y: n.y, t: n.t });
      if (i > 0) {
        edgeConstraints.push({
          from: { x: arr[i - 1].x, y: arr[i - 1].y },
          to: { x: n.x, y: n.y },
          t: n.t,
        });
      }
    });
    sequence.push(
      ...pathToDrop.map((n) => ({ x: n.x, y: n.y, action: n.action })),
    );

    time = dropStep.t;
    current = vehicle.drop;
  }

  // Optional: return to start
  const pathToStart = aStar(
    grid,
    current,
    vehicle.start,
    constraints,
    time,
    'move',
    edgeConstraints,
  );
  if (pathToStart) {
    pathToStart.forEach((n, i, arr) => {
      constraints.push({ x: n.x, y: n.y, t: n.t });
      if (i > 0) {
        edgeConstraints.push({
          from: { x: arr[i - 1].x, y: arr[i - 1].y },
          to: { x: n.x, y: n.y },
          t: n.t,
        });
      }
    });
    sequence.push(
      ...pathToStart.map((n) => ({ x: n.x, y: n.y, action: n.action })),
    );
  }

  return { path: sequence, constraints, edgeConstraints };
}

// Update planAllPaths to use edge constraints
export function CA(grid: string[][], vehicles: Vehicle[]) {
  const constraints: Constraint[] = [];
  const edgeConstraints: EdgeConstraint[] = [];

  for (const vehicle of vehicles) {
    const { path } = buildPathSequence(
      grid,
      vehicle,
      constraints,
      edgeConstraints,
    );
    vehicle.path = path;
  }

  return {
    vehicles,
    metrics: { ...calculateCooperativeAStarMetrics(vehicles) },
  };
}

function calculateCooperativeAStarMetrics(
  vehicles: {
    code: string;
    path: { x: number; y: number; action: string }[];
  }[],
) {
  let estimatedPickingTime = 0;
  let estimatedVehiclesStoppingTime = 0;
  let idleSteps = 0;
  let totalPathLength = 0;
  const pathLengths: number[] = [];

  for (const vehicle of vehicles) {
    if (!vehicle.path.length) continue;

    // estimatedPickingTime: max t in all paths
    if (vehicle.path.length > estimatedPickingTime) {
      estimatedPickingTime = vehicle.path.length;
    }

    // idleSteps: total 'stop' actions for all vehicles
    const vehicleIdleSteps = vehicle.path.filter(
      (step) => step.action === 'stop',
    ).length;
    idleSteps += vehicleIdleSteps;

    // estimatedVehiclesStoppingTime: max idle steps of any vehicle
    estimatedVehiclesStoppingTime = vehicleIdleSteps;

    // totalPathLength: total 'move' actions for all vehicles
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
    estimatedVehiclesStoppingTime,
    idleSteps,
    totalPathLength,
    averagePathLength,
  };
}

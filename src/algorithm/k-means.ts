import { Carton } from './models/carton';
import { Job } from './models/job';

type Pos2D = { x: number; y: number };

function euclideanDist(a: Pos2D, b: Pos2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getCentroid(cartons: Carton[]): Pos2D {
  const sum = cartons.reduce(
    (acc, c) => ({
      x: acc.x + c.coordinate.x,
      y: acc.y + c.coordinate.y,
    }),
    { x: 0, y: 0 },
  );
  const len = cartons.length;
  return { x: sum.x / len, y: sum.y / len };
}

// K-Means++ initialization
function kMeansPlusPlusInit(cartons: Carton[], k: number): Pos2D[] {
  const centroids: Pos2D[] = [];
  const data = cartons.map((c) => ({ x: c.coordinate.x, y: c.coordinate.y }));
  centroids.push(data[Math.floor(Math.random() * data.length)]);

  while (centroids.length < k) {
    const distances = data.map(
      (p) => Math.min(...centroids.map((c) => euclideanDist(p, c))) ** 2,
    );
    const total = distances.reduce((sum, d) => sum + d, 0);
    const probs = distances.map((d) => d / total);
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (r < cumulative) {
        centroids.push(data[i]);
        break;
      }
    }
  }
  return centroids;
}

const kMeans = (cartons: Carton[], numberOfVehicle: number): Job[] => {
  const k = Math.min(numberOfVehicle, cartons.length);
  const maxPerCluster = Math.ceil(cartons.length / k);
  let centroids = kMeansPlusPlusInit(cartons, k);
  let clusters: Carton[][] = [];

  for (let iter = 0; iter < 100; iter++) {
    clusters = Array.from({ length: k }, () => []);

    // Gán carton vào cụm gần nhất, không vượt quá maxPerCluster
    for (const carton of cartons) {
      const pos = { x: carton.coordinate.x, y: carton.coordinate.y };
      const dists = centroids
        .map((c, idx) => ({
          idx,
          dist: euclideanDist(pos, c),
        }))
        .sort((a, b) => a.dist - b.dist);

      for (const { idx } of dists) {
        if (clusters[idx].length < maxPerCluster) {
          clusters[idx].push(carton);
          break;
        }
      }
    }

    // Nếu còn carton chưa được gán (rất hiếm), gán vào cụm nhỏ nhất
    const assigned = new Set(clusters.flat().map((c) => c.id));
    for (const carton of cartons) {
      if (!assigned.has(carton.id)) {
        const smallest = clusters.reduce(
          (min, curr, i) => (curr.length < clusters[min].length ? i : min),
          0,
        );
        clusters[smallest].push(carton);
      }
    }

    // Cập nhật centroid, tránh NaN nếu cụm rỗng
    const newCentroids = clusters.map((group, i) =>
      group.length > 0 ? getCentroid(group) : centroids[i],
    );
    const converged = newCentroids.every(
      (c, i) => euclideanDist(c, centroids[i]) < 0.001,
    );
    centroids = newCentroids;
    if (converged) break;
  }

  return clusters.map((group) => ({
    cartons: group,
  }));
};

export default kMeans;

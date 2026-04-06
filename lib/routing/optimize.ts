import type { DistanceMetric, OptimizedRouteResponse, RoutePoint, TaskCoordinate } from "@/types/database";

const EPSILON = 1e-9;

const ALGORITHM_LABELS = {
  "nearest-neighbor": "Nearest Neighbor",
  "nearest-neighbor-2opt": "Nearest Neighbor + 2-opt",
} as const;

export function computeDistance(from: RoutePoint, to: RoutePoint, metric: DistanceMetric): number {
  const deltaX = Math.abs(to.x - from.x);
  const deltaY = Math.abs(to.y - from.y);

  if (metric === "euclidean") {
    return Math.hypot(deltaX, deltaY);
  }

  return deltaX + deltaY;
}

export function computeTotalCoordinateDistance(
  orderedTasks: TaskCoordinate[],
  metric: DistanceMetric,
  startPoint: RoutePoint,
): number {
  let totalDistance = 0;
  let currentPoint = startPoint;

  for (const task of orderedTasks) {
    const nextPoint = { x: task.x, y: task.y };
    totalDistance += computeDistance(currentPoint, nextPoint, metric);
    currentPoint = nextPoint;
  }

  return totalDistance;
}

function generateNearestNeighborRoute(
  startPoint: RoutePoint,
  taskCoordinates: TaskCoordinate[],
  metric: DistanceMetric,
): TaskCoordinate[] {
  const unvisited = [...taskCoordinates];
  const optimizedSequence: TaskCoordinate[] = [];
  let currentPoint = startPoint;

  while (unvisited.length > 0) {
    let nearestIndex = 0;

    for (let idx = 1; idx < unvisited.length; idx += 1) {
      const currentNearest = unvisited[nearestIndex];
      const candidate = unvisited[idx];

      const currentNearestDistance = computeDistance(currentPoint, currentNearest, metric);
      const candidateDistance = computeDistance(currentPoint, candidate, metric);

      if (
        candidateDistance < currentNearestDistance ||
        (candidateDistance === currentNearestDistance && candidate.taskId < currentNearest.taskId)
      ) {
        nearestIndex = idx;
      }
    }

    const [nearest] = unvisited.splice(nearestIndex, 1);
    optimizedSequence.push(nearest);
    currentPoint = nearest;
  }

  return optimizedSequence;
}

function twoOptSwap(route: TaskCoordinate[], i: number, k: number): TaskCoordinate[] {
  return [...route.slice(0, i), ...route.slice(i, k + 1).reverse(), ...route.slice(k + 1)];
}

function improveWithTwoOpt(
  nearestNeighborRoute: TaskCoordinate[],
  startPoint: RoutePoint,
  metric: DistanceMetric,
): TaskCoordinate[] {
  let improvedRoute = [...nearestNeighborRoute];
  let bestDistance = computeTotalCoordinateDistance(improvedRoute, metric, startPoint);

  let didImprove = true;

  while (didImprove) {
    didImprove = false;

    outer: for (let i = 0; i < improvedRoute.length - 1; i += 1) {
      for (let k = i + 1; k < improvedRoute.length; k += 1) {
        const candidateRoute = twoOptSwap(improvedRoute, i, k);
        const candidateDistance = computeTotalCoordinateDistance(candidateRoute, metric, startPoint);

        if (candidateDistance + EPSILON < bestDistance) {
          improvedRoute = candidateRoute;
          bestDistance = candidateDistance;
          didImprove = true;
          break outer;
        }
      }
    }
  }

  return improvedRoute;
}

export function optimizeRouteFromCoordinates(
  startPoint: RoutePoint,
  taskCoordinates: TaskCoordinate[],
  metric: DistanceMetric,
  algorithm: "nearest-neighbor" | "nearest-neighbor-2opt",
): OptimizedRouteResponse {
  const beforeDistance = computeTotalCoordinateDistance(taskCoordinates, metric, startPoint);
  const nearestNeighborRoute = generateNearestNeighborRoute(startPoint, taskCoordinates, metric);

  const optimizedSequence =
    algorithm === "nearest-neighbor-2opt"
      ? improveWithTwoOpt(nearestNeighborRoute, startPoint, metric)
      : nearestNeighborRoute;

  const afterDistance = computeTotalCoordinateDistance(optimizedSequence, metric, startPoint);
  const improvementPercent =
    beforeDistance === 0 ? 0 : ((beforeDistance - afterDistance) / beforeDistance) * 100;

  return {
    startPoint,
    metric,
    orderedTaskIds: optimizedSequence.map((task) => task.taskId),
    totalOptimizedDistance: afterDistance,
    algorithm,
    initialAlgorithmName: ALGORITHM_LABELS["nearest-neighbor"],
    finalAlgorithmName: ALGORITHM_LABELS[algorithm],
    comparison: {
      beforeDistance,
      afterDistance,
      improvementPercent,
    },
  };
}

import { createClient } from "@/lib/supabase/server";
import type {
  BaselineRouteResponse,
  DistanceMetric,
  OptimizedRouteResponse,
  RoutePoint,
  TaskCoordinate,
  TaskWithLocation,
} from "@/types/database";

export const DISPATCH_START_POINT: RoutePoint = { x: 0, y: 0 };
export const DEFAULT_DISTANCE_METRIC: DistanceMetric = "manhattan";

function resolveDistanceMetric(rawMetric: string | undefined): DistanceMetric {
  if (rawMetric === "euclidean") {
    return "euclidean";
  }

  return DEFAULT_DISTANCE_METRIC;
}

function isTaskWithLocation(value: unknown): value is TaskWithLocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TaskWithLocation>;
  const location = candidate.location as TaskWithLocation["location"] | undefined;

  return (
    typeof candidate.id === "number" &&
    (candidate.status === "pending" ||
      candidate.status === "in_progress" ||
      candidate.status === "completed") &&
    Boolean(location) &&
    typeof location?.id === "number" &&
    typeof location?.name === "string" &&
    typeof location?.x === "number" &&
    typeof location?.y === "number"
  );
}

function ensureTaskWithLocationList(data: unknown): TaskWithLocation[] {
  if (!Array.isArray(data) || !data.every(isTaskWithLocation)) {
    throw new Error("Supabase returned unexpected task/location payload.");
  }

  return data;
}

function computeDistance(from: RoutePoint, to: RoutePoint, metric: DistanceMetric): number {
  const deltaX = Math.abs(to.x - from.x);
  const deltaY = Math.abs(to.y - from.y);

  if (metric === "euclidean") {
    return Math.hypot(deltaX, deltaY);
  }

  return deltaX + deltaY;
}

export function computeTotalRouteDistance(
  orderedTasks: TaskWithLocation[],
  metric: DistanceMetric,
  startPoint: RoutePoint = DISPATCH_START_POINT,
): number {
  let totalDistance = 0;
  let currentPoint = startPoint;

  for (const task of orderedTasks) {
    const nextPoint = { x: task.location.x, y: task.location.y };
    totalDistance += computeDistance(currentPoint, nextPoint, metric);
    currentPoint = nextPoint;
  }

  return totalDistance;
}

function computeTotalCoordinateDistance(
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

export function optimizeTaskRouteFromCoordinates(
  startPoint: RoutePoint,
  taskCoordinates: TaskCoordinate[],
  metric: DistanceMetric = DEFAULT_DISTANCE_METRIC,
): OptimizedRouteResponse {
  const beforeDistance = computeTotalCoordinateDistance(taskCoordinates, metric, startPoint);

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

  const afterDistance = computeTotalCoordinateDistance(optimizedSequence, metric, startPoint);
  const improvementPercent =
    beforeDistance === 0 ? 0 : ((beforeDistance - afterDistance) / beforeDistance) * 100;

  return {
    startPoint,
    metric,
    orderedTaskIds: optimizedSequence.map((task) => task.taskId),
    totalOptimizedDistance: afterDistance,
    comparison: {
      beforeDistance,
      afterDistance,
      improvementPercent,
    },
  };
}

export async function getPendingTasksWithLocations(): Promise<TaskWithLocation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id,status,location:locations!tasks_location_id_fkey(id,name,x,y)")
    .eq("status", "pending")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load pending tasks: ${error.message}`);
  }

  return ensureTaskWithLocationList(data);
}

export async function getPendingTaskRouteBaseline(
  metricFlag: string | undefined = process.env.ROUTE_DISTANCE_METRIC,
): Promise<BaselineRouteResponse> {
  const orderedTasks = await getPendingTasksWithLocations();
  const metric = resolveDistanceMetric(metricFlag);

  return {
    startPoint: DISPATCH_START_POINT,
    metric,
    sequence: orderedTasks.map((task) => ({
      taskId: task.id,
      locationId: task.location.id,
      locationName: task.location.name,
      x: task.location.x,
      y: task.location.y,
    })),
    totalDistance: computeTotalRouteDistance(orderedTasks, metric, DISPATCH_START_POINT),
  };
}

export async function getPendingTaskRouteOptimized(
  metricFlag: string | undefined = process.env.ROUTE_DISTANCE_METRIC,
): Promise<OptimizedRouteResponse> {
  const metric = resolveDistanceMetric(metricFlag);
  const pendingTasks = await getPendingTasksWithLocations();
  const taskCoordinates: TaskCoordinate[] = pendingTasks.map((task) => ({
    taskId: task.id,
    x: task.location.x,
    y: task.location.y,
  }));

  return optimizeTaskRouteFromCoordinates(DISPATCH_START_POINT, taskCoordinates, metric);
}

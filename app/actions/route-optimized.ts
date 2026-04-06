"use server";

import { getPendingTaskRouteOptimized } from "@/lib/tasks";

export async function getOptimizedRouteAction(metricFlag?: string) {
  return getPendingTaskRouteOptimized(metricFlag);
}

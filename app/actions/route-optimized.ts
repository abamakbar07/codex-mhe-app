"use server";

import { getPendingTaskRouteOptimized } from "@/lib/tasks";

export async function getOptimizedRouteAction(metricFlag?: string, algorithmFlag?: string) {
  return getPendingTaskRouteOptimized(metricFlag, algorithmFlag);
}

"use server";

import { getPendingTaskRouteBaseline } from "@/lib/tasks";

export async function getRouteBaselineAction(metricFlag?: string) {
  return getPendingTaskRouteBaseline(metricFlag);
}

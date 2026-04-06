import { NextResponse } from "next/server";

import { getPendingTaskRouteOptimized } from "@/lib/tasks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get("metric") ?? undefined;
  const algorithm = searchParams.get("algorithm") ?? undefined;

  try {
    const payload = await getPendingTaskRouteOptimized(metric, algorithm);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to optimize route.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

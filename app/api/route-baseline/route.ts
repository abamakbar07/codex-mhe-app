import { NextResponse } from "next/server";

import { getPendingTaskRouteBaseline } from "@/lib/tasks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get("metric") ?? undefined;

  try {
    const payload = await getPendingTaskRouteBaseline(metric);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load baseline route.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

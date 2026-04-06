import { createClient } from "@/lib/supabase/server";
import type { TaskWithLocation } from "@/types/database";

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

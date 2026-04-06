import { getRouteBaselineAction } from "@/app/actions/route-baseline";
import { getOptimizedRouteAction } from "@/app/actions/route-optimized";
import RouteMapPanel from "@/components/route-map-panel";

export default async function DashboardShell() {
  const baseline = await getRouteBaselineAction();
  const optimized = await getOptimizedRouteAction();

  return (
    <main>
      <h1>Operations Dashboard</h1>
      <p>Baseline route uses a deterministic pending-task order (`tasks.id ASC`) from dispatch dock (0,0).</p>
      <section className="grid">
        <article className="panel">
          <h2>Baseline Task Sequence</h2>
          <ul>
            {baseline.sequence.map((stop) => (
              <li key={stop.taskId}>
                Task #{stop.taskId} · {stop.locationName} ({stop.x}, {stop.y})
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Route Metrics</h2>
          <div>
            Metric: <strong>{baseline.metric}</strong>
          </div>
          <div>
            Total Distance: <strong>{baseline.totalDistance.toFixed(2)}</strong>
          </div>
          <div>
            Start Point: <strong>({baseline.startPoint.x}, {baseline.startPoint.y})</strong>
          </div>
        </article>
        <article className="panel">
          <h2>Optimized Route (Nearest Unvisited)</h2>
          <div>
            Ordered Task IDs: <strong>{optimized.orderedTaskIds.join(" → ") || "None"}</strong>
          </div>
          <div>
            Total Distance: <strong>{optimized.totalOptimizedDistance.toFixed(2)}</strong>
          </div>
          <div>
            Before Distance: <strong>{optimized.comparison.beforeDistance.toFixed(2)}</strong>
          </div>
          <div>
            After Distance: <strong>{optimized.comparison.afterDistance.toFixed(2)}</strong>
          </div>
          <div>
            Improvement: <strong>{optimized.comparison.improvementPercent.toFixed(2)}%</strong>
          </div>
        </article>
        <RouteMapPanel baseline={baseline} optimized={optimized} />
      </section>
    </main>
  );
}

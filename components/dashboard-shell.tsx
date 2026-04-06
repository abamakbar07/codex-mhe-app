import { getRouteBaselineAction } from "@/app/actions/route-baseline";

export default async function DashboardShell() {
  const baseline = await getRouteBaselineAction();

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
          <h2>Map Panel</h2>
          <div className="placeholder">Map panel placeholder (pins, paths, and active driver location).</div>
        </article>
      </section>
    </main>
  );
}

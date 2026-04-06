import { getPendingTasksWithLocations } from "@/lib/tasks";

export default async function DashboardShell() {
  const pendingTasks = await getPendingTasksWithLocations();

  return (
    <main>
      <h1>Operations Dashboard</h1>
      <p>Pending tasks now include location coordinates from a single joined query.</p>
      <section className="grid">
        <article className="panel">
          <h2>Pending Task List</h2>
          <ul>
            {pendingTasks.map((task) => (
              <li key={task.id}>
                Task #{task.id} · {task.location.name} ({task.location.x}, {task.location.y})
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Route Metrics</h2>
          <div className="placeholder">Route metrics placeholder (ETA, stop count, total distance).</div>
        </article>
        <article className="panel">
          <h2>Map Panel</h2>
          <div className="placeholder">Map panel placeholder (pins, paths, and active driver location).</div>
        </article>
      </section>
    </main>
  );
}

export default function DashboardShell() {
  return (
    <main>
      <h1>Operations Dashboard</h1>
      <p>Base app scaffold with Supabase configuration and route planning placeholders.</p>
      <section className="grid">
        <article className="panel">
          <h2>Task List</h2>
          <div className="placeholder">Task list placeholder (connected to Supabase tasks table).</div>
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

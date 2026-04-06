"use client";

import { useCallback, useEffect, useState } from "react";

import RouteMapPanel from "@/components/route-map-panel";
import type {
  BaselineRouteResponse,
  DistanceMetric,
  OptimizedRouteResponse,
  RouteAlgorithm,
} from "@/types/database";

const DISTANCE_METRICS: DistanceMetric[] = ["manhattan", "euclidean"];

const ROUTE_ALGORITHMS: Array<{ value: RouteAlgorithm; label: string }> = [
  { value: "nearest-neighbor", label: "Nearest Neighbor" },
  { value: "nearest-neighbor-2opt", label: "Nearest Neighbor + 2-opt" },
];

async function fetchRouteBaseline(metric: DistanceMetric): Promise<BaselineRouteResponse> {
  const response = await fetch(`/api/route-baseline?metric=${metric}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to fetch baseline route.");
  }

  return response.json();
}

async function fetchRouteOptimized(
  metric: DistanceMetric,
  algorithm: RouteAlgorithm,
): Promise<OptimizedRouteResponse> {
  const response = await fetch(`/api/route-optimized?metric=${metric}&algorithm=${algorithm}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to fetch optimized route.");
  }

  return response.json();
}

export default function DashboardShell() {
  const [metric, setMetric] = useState<DistanceMetric>("manhattan");
  const [algorithm, setAlgorithm] = useState<RouteAlgorithm>("nearest-neighbor");
  const [baseline, setBaseline] = useState<BaselineRouteResponse | null>(null);
  const [optimized, setOptimized] = useState<OptimizedRouteResponse | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);

  const loadData = useCallback(async (metricToLoad: DistanceMetric, algorithmToLoad: RouteAlgorithm) => {
    setIsDataLoading(true);
    setDataError(null);
    setOptimizeError(null);

    try {
      const [baselinePayload, optimizedPayload] = await Promise.all([
        fetchRouteBaseline(metricToLoad),
        fetchRouteOptimized(metricToLoad, algorithmToLoad),
      ]);

      setBaseline(baselinePayload);
      setOptimized(optimizedPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load dashboard data.";
      setDataError(message);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(metric, algorithm);
  }, [algorithm, loadData, metric]);

  const handleRecompute = useCallback(async () => {
    setIsOptimizing(true);
    setOptimizeError(null);

    try {
      const payload = await fetchRouteOptimized(metric, algorithm);
      setOptimized(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to recompute optimized route.";
      setOptimizeError(message);
    } finally {
      setIsOptimizing(false);
    }
  }, [algorithm, metric]);

  return (
    <main>
      <h1>Operations Dashboard</h1>
      <p>Baseline route uses a deterministic pending-task order (`tasks.id ASC`) from dispatch dock (0,0).</p>

      <section className="panel controls-panel" aria-label="Route controls">
        <label htmlFor="metric-selector">Distance metric</label>
        <select
          id="metric-selector"
          value={metric}
          onChange={(event) => setMetric(event.target.value as DistanceMetric)}
          disabled={isDataLoading || isOptimizing}
        >
          {DISTANCE_METRICS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="algorithm-selector">Optimization algorithm</label>
        <select
          id="algorithm-selector"
          value={algorithm}
          onChange={(event) => setAlgorithm(event.target.value as RouteAlgorithm)}
          disabled={isDataLoading || isOptimizing}
        >
          {ROUTE_ALGORITHMS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button type="button" onClick={() => void handleRecompute()} disabled={isDataLoading || isOptimizing || !baseline}>
          {isOptimizing ? "Recomputing…" : "Recompute optimized route"}
        </button>
      </section>

      {dataError && (
        <section className="panel status-panel error" role="status" aria-live="polite">
          Failed to load data: {dataError}
        </section>
      )}

      {optimizeError && (
        <section className="panel status-panel error" role="status" aria-live="polite">
          Failed to optimize route: {optimizeError}
        </section>
      )}

      {isDataLoading && (
        <section className="panel status-panel" role="status" aria-live="polite">
          Loading baseline and optimized route data…
        </section>
      )}

      {!isDataLoading && baseline && optimized && (
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
            <h2>Optimized Route</h2>
            <div>
              Initial Algorithm: <strong>{optimized.initialAlgorithmName}</strong>
            </div>
            <div>
              Selected Algorithm: <strong>{optimized.finalAlgorithmName}</strong>
            </div>
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
      )}
    </main>
  );
}

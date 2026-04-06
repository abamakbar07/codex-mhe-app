"use client";

import { useMemo, useState } from "react";
import type { BaselineRouteResponse, BaselineRouteStop, OptimizedRouteResponse } from "@/types/database";

type RouteMapPanelProps = {
  baseline: BaselineRouteResponse;
  optimized: OptimizedRouteResponse;
};

type VisibilityMode = "baseline" | "optimized" | "both";

type ScaledPoint = BaselineRouteStop & {
  sx: number;
  sy: number;
};

const SVG_WIDTH = 560;
const SVG_HEIGHT = 320;
const SVG_PADDING = 28;

function getScaledPoints(points: BaselineRouteStop[]) {
  const allX = [0, ...points.map((point) => point.x)];
  const allY = [0, ...points.map((point) => point.y)];
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const availableWidth = SVG_WIDTH - SVG_PADDING * 2;
  const availableHeight = SVG_HEIGHT - SVG_PADDING * 2;

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  return points.map((point) => {
    const sx = SVG_PADDING + ((point.x - minX) / spanX) * availableWidth;
    const sy = SVG_HEIGHT - (SVG_PADDING + ((point.y - minY) / spanY) * availableHeight);
    return { ...point, sx, sy };
  });
}

function polylinePoints(points: ScaledPoint[]) {
  return [`${SVG_PADDING},${SVG_HEIGHT - SVG_PADDING}`, ...points.map((point) => `${point.sx},${point.sy}`)].join(
    " ",
  );
}

export default function RouteMapPanel({ baseline, optimized }: RouteMapPanelProps) {
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("both");

  const baselineByTaskId = useMemo(
    () => new Map(baseline.sequence.map((stop) => [stop.taskId, stop])),
    [baseline.sequence],
  );

  const optimizedSequence = useMemo(
    () => optimized.orderedTaskIds.map((taskId) => baselineByTaskId.get(taskId)).filter(Boolean) as BaselineRouteStop[],
    [baselineByTaskId, optimized.orderedTaskIds],
  );

  const scaledBaseline = useMemo(() => getScaledPoints(baseline.sequence), [baseline.sequence]);
  const scaledOptimized = useMemo(() => getScaledPoints(optimizedSequence), [optimizedSequence]);

  const deltaDistance = optimized.comparison.beforeDistance - optimized.comparison.afterDistance;

  return (
    <article className="panel map-panel">
      <h2>Route Map</h2>
      <div className="metrics-row">
        <div>
          Before: <strong>{optimized.comparison.beforeDistance.toFixed(2)}</strong>
        </div>
        <div>
          After: <strong>{optimized.comparison.afterDistance.toFixed(2)}</strong>
        </div>
        <div>
          Delta: <strong>{deltaDistance.toFixed(2)}</strong>
        </div>
        <div>
          Improvement: <strong>{optimized.comparison.improvementPercent.toFixed(2)}%</strong>
        </div>
      </div>

      <div className="toggle-group" role="group" aria-label="Route visibility">
        <button
          type="button"
          className={visibilityMode === "baseline" ? "active" : ""}
          onClick={() => setVisibilityMode("baseline")}
        >
          Baseline
        </button>
        <button
          type="button"
          className={visibilityMode === "optimized" ? "active" : ""}
          onClick={() => setVisibilityMode("optimized")}
        >
          Optimized
        </button>
        <button type="button" className={visibilityMode === "both" ? "active" : ""} onClick={() => setVisibilityMode("both")}>
          Both
        </button>
      </div>

      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-label="Warehouse route map"
      >
        <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#f9fbff" stroke="#d4dbe6" rx="8" />

        {(visibilityMode === "baseline" || visibilityMode === "both") && (
          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth={3}
            points={polylinePoints(scaledBaseline)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {(visibilityMode === "optimized" || visibilityMode === "both") && (
          <polyline
            fill="none"
            stroke="#059669"
            strokeWidth={3}
            points={polylinePoints(scaledOptimized)}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={visibilityMode === "both" ? "8 4" : undefined}
          />
        )}

        <circle cx={SVG_PADDING} cy={SVG_HEIGHT - SVG_PADDING} r={6} fill="#0f172a" />

        {scaledBaseline.map((point) => (
          <g key={point.taskId}>
            <circle cx={point.sx} cy={point.sy} r={5} fill="#ffffff" stroke="#1f2937" strokeWidth={2} />
            <title>
              Task #{point.taskId} • {point.locationName}
            </title>
          </g>
        ))}
      </svg>
    </article>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Bar,
  Doughnut,
  Line,
  Radar,
  PolarArea,
  Bubble,
  Pie,
  Scatter,
} from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { useTheme, cssToken } from "@/client/lib/theme";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
);

ChartJS.defaults.font.family = '"IBM Plex Mono", ui-monospace, monospace';
ChartJS.defaults.font.size = 10;
ChartJS.defaults.animation = { duration: 400, easing: "easeOutQuart" };

/** Themed option factory — rebuild on every theme change. */
export function useChartTokens() {
  const { resolved } = useTheme();
  return useMemo(() => {
    void resolved; // recompute when the theme flips
    return {
      fg: cssToken("--fg") || "#fff",
      fg2: cssToken("--fg-2") || "#94a3b8",
      fg3: cssToken("--fg-3") || "#64748b",
      grid: cssToken("--grid-line") || "rgba(148,163,184,.08)",
      line: cssToken("--hairline") || "rgba(148,163,184,.14)",
      accent: cssToken("--accent") || "#4f8cff",
      mint: cssToken("--mint") || "#43d6c2",
      amber: cssToken("--amber") || "#ffb866",
      violet: cssToken("--violet") || "#b08cff",
      surface: cssToken("--bg-2") || "#151b2a",
    };
  }, [resolved]);
}

function baseOptions<T extends "bar" | "line">(
  t: ReturnType<typeof useChartTokens>,
  horizontal = false,
): ChartOptions<T> {
  return {
    indexAxis: horizontal ? ("y" as const) : ("x" as const),
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t.line,
        borderWidth: 1,
        titleColor: t.fg,
        bodyColor: t.fg2,
        padding: 10,
        cornerRadius: 0,
        displayColors: false,
        titleFont: { family: '"IBM Plex Mono", monospace', size: 10 },
        bodyFont: { family: '"IBM Plex Mono", monospace', size: 10 },
      },
    },
    scales: {
      x: {
        grid: { color: t.grid, drawTicks: false },
        border: { color: t.line },
        ticks: { color: t.fg3, padding: 6 },
      },
      y: {
        grid: { color: t.grid, drawTicks: false },
        border: { display: false },
        ticks: { color: t.fg3, padding: 6 },
      },
    },
  } as unknown as ChartOptions<T>;
}

export function ThemedBar({
  data,
  height = 200,
  horizontal,
}: {
  data: ChartData<"bar">;
  height?: number;
  horizontal?: boolean;
}) {
  const t = useChartTokens();
  return (
    <div style={{ height }}>
      <Bar data={data} options={baseOptions<"bar">(t, horizontal)} />
    </div>
  );
}

export function ThemedLine({
  data,
  height = 180,
}: {
  data: ChartData<"line">;
  height?: number;
}) {
  const t = useChartTokens();
  const opts = baseOptions<"line">(t);
  return (
    <div style={{ height }}>
      <Line data={data} options={opts} />
    </div>
  );
}

export function ThemedRadar({
  data,
  height = 260,
}: {
  data: ChartData<"radar">;
  height?: number;
}) {
  const t = useChartTokens();
  const opts: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: t.fg3, boxWidth: 8, boxHeight: 8, padding: 14, font: { size: 10 } },
      },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t.line,
        borderWidth: 1,
        titleColor: t.fg,
        bodyColor: t.fg2,
        cornerRadius: 0,
        displayColors: false,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 3,
        ticks: { stepSize: 1, color: t.fg3, backdropColor: "transparent", font: { size: 9 } },
        grid: { color: t.grid },
        angleLines: { color: t.grid },
        pointLabels: { color: t.fg2, font: { size: 10 } },
      },
    },
  };
  return (
    <div style={{ height }}>
      <Radar data={data} options={opts} />
    </div>
  );
}

export function ThemedDoughnut({
  data,
  height = 190,
}: {
  data: ChartData<"doughnut">;
  height?: number;
}) {
  const t = useChartTokens();
  const opts: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: t.fg3, boxWidth: 8, boxHeight: 8, padding: 12, font: { size: 10 } },
      },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t.line,
        borderWidth: 1,
        titleColor: t.fg,
        bodyColor: t.fg2,
        cornerRadius: 0,
      },
    },
  };
  return (
    <div style={{ height }}>
      <Doughnut data={data} options={opts} />
    </div>
  );
}

/** Forces Chart.js to repaint when the theme changes (canvas colours are baked). */
export function ChartRepaint() {
  const { resolved } = useTheme();
  const ref = useRef<ChartJS | null>(null);
  useEffect(() => {
    Object.values(ChartJS.instances).forEach((c) => {
      c.resize();
      c.update("none");
    });
    void ref;
  }, [resolved]);
  return null;
}

// re-exported so pages can build datasets without importing chart.js directly
export {
  PolarArea,
  Bubble,
  Pie,
  Scatter,
  type ChartData,
  type ChartOptions,
};

"use client";

import { useId } from "react";

export type Point = { label: string; value: number };

const W = 640;
const H = 240;
const PAD = { t: 18, r: 16, b: 30, l: 40 };

function niceBounds(min: number, max: number) {
  if (min === max) {
    const d = Math.abs(min) * 0.1 || 1;
    return { lo: min - d, hi: max + d };
  }
  const span = max - min;
  return { lo: min - span * 0.12, hi: max + span * 0.12 };
}

/** Courbe de progression (poids du corps, charges…). */
export function LineChart({
  points,
  color = "var(--accent)",
  unit = "",
}: {
  points: Point[];
  color?: string;
  unit?: string;
}) {
  const gid = useId();
  if (points.length === 0) return <ChartEmpty />;

  const values = points.map((p) => p.value);
  const { lo, hi } = niceBounds(Math.min(...values), Math.max(...values));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const x = (i: number) =>
    PAD.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.t + ih - ((v - lo) / (hi - lo)) * ih;

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const area = `${PAD.l},${PAD.t + ih} ${line} ${PAD.l + iw},${PAD.t + ih}`;

  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => lo + ((hi - lo) * i) / ticks);

  // n'afficher qu'un sous-ensemble de labels x pour éviter le chevauchement
  const step = Math.ceil(points.length / 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Graphique de progression">
      <defs>
        <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
            {Math.round(v)}
          </text>
        </g>
      ))}

      <polyline points={area} fill={`url(#grad-${gid})`} stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r={3} fill="var(--surface)" stroke={color} strokeWidth={2} />
      ))}

      {points.map((p, i) =>
        i % step === 0 || i === points.length - 1 ? (
          <text
            key={i}
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize={11}
            fill="var(--text-muted)"
          >
            {p.label}
          </text>
        ) : null
      )}

      {/* dernière valeur mise en avant */}
      {points.length > 0 && (
        <text
          x={x(points.length - 1)}
          y={y(points[points.length - 1].value) - 10}
          textAnchor="end"
          fontSize={12}
          fontWeight={600}
          fill={color}
        >
          {points[points.length - 1].value}
          {unit}
        </text>
      )}
    </svg>
  );
}

/** Barres (calories par jour). */
export function BarChart({
  points,
  goal,
  color = "var(--calorie)",
}: {
  points: Point[];
  goal?: number;
  color?: string;
}) {
  if (points.length === 0) return <ChartEmpty />;

  const values = points.map((p) => p.value);
  const max = Math.max(...values, goal ?? 0, 1);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const slot = iw / points.length;
  const bw = Math.min(slot * 0.6, 46);

  const y = (v: number) => PAD.t + ih - (v / max) * ih;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Calories par jour">
      {[0, 0.5, 1].map((f, i) => (
        <g key={i}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(max * f)}
            y2={y(max * f)}
            stroke="var(--border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <text x={PAD.l - 8} y={y(max * f) + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
            {Math.round(max * f)}
          </text>
        </g>
      ))}

      {points.map((p, i) => {
        const cx = PAD.l + slot * i + slot / 2;
        const h = PAD.t + ih - y(p.value);
        const over = goal !== undefined && p.value > goal;
        return (
          <g key={i}>
            <rect
              x={cx - bw / 2}
              y={y(p.value)}
              width={bw}
              height={Math.max(h, 0)}
              rx={6}
              fill={over ? "var(--danger)" : color}
              opacity={0.9}
            />
            <text x={cx} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
              {p.label}
            </text>
          </g>
        );
      })}

      {goal !== undefined && goal > 0 && (
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={y(goal)}
          y2={y(goal)}
          stroke="var(--accent)"
          strokeWidth={2}
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-[180px] items-center justify-center text-sm text-text-muted">
      Pas encore de données à afficher.
    </div>
  );
}

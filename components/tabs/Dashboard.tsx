"use client";

import { useMemo } from "react";
import { AppData } from "@/lib/types";
import { today, formatDate, formatDateShort, formatNumber } from "@/lib/format";
import {
  bmiCategory,
  caloriePoints,
  caloriesForDate,
  computeBMI,
  workoutsThisWeek,
} from "@/lib/stats";
import { BarChart, LineChart, Point } from "@/components/Charts";
import { Card, SectionTitle, StatCard, EmptyState } from "@/components/ui";

export function Dashboard({ data }: { data: AppData }) {
  const td = today();
  const dayCal = caloriesForDate(data.meals, td);
  const goal = data.calorieGoal || 0;
  const remaining = goal - dayCal;

  const sortedBw = useMemo(
    () => [...data.bodyWeights].sort((a, b) => a.date.localeCompare(b.date)),
    [data.bodyWeights]
  );
  const latestBw = sortedBw[sortedBw.length - 1]?.weight;
  const bmi = computeBMI(latestBw, data.height);
  const bmiCat = bmi !== null ? bmiCategory(bmi) : null;

  const calChart = useMemo(() => caloriePoints(data.meals, 7), [data.meals]);
  const bwPoints: Point[] = useMemo(
    () => sortedBw.map((b) => ({ label: formatDateShort(b.date), value: b.weight })),
    [sortedBw]
  );

  const recent = useMemo(() => {
    const items = [
      ...data.workouts.map((w) => ({
        date: w.date,
        text: `${w.exercise} — ${w.weight} kg × ${w.reps}`,
        tag: "Muscu",
        color: "var(--accent)",
      })),
      ...data.meals.map((m) => ({
        date: m.date,
        text: `${m.name} — ${formatNumber(m.calories)} kcal`,
        tag: "Repas",
        color: "var(--calorie)",
      })),
      ...data.cardio.map((c) => ({
        date: c.date,
        text: `${c.activity} — ${c.duration} min · ${formatNumber(c.calories)} kcal`,
        tag: "Cardio",
        color: "var(--accent)",
      })),
    ];
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }, [data.workouts, data.meals, data.cardio]);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Calories aujourd'hui"
          value={formatNumber(dayCal)}
          unit={`/ ${formatNumber(goal)}`}
          accent="var(--calorie)"
        />
        <StatCard
          label="Restant"
          value={formatNumber(Math.abs(remaining))}
          unit="kcal"
          accent={remaining >= 0 ? "var(--accent)" : "var(--danger)"}
          hint={remaining >= 0 ? "sous l'objectif" : "au-dessus"}
        />
        <StatCard
          label="Poids actuel"
          value={latestBw ?? "—"}
          unit={latestBw ? "kg" : ""}
          accent="var(--accent)"
        />
        <StatCard
          label="Séances (7j)"
          value={workoutsThisWeek(data)}
          accent="var(--accent)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-in">
          <SectionTitle title="Calories · 7 jours" subtitle="Ligne = objectif" />
          <BarChart points={calChart} goal={goal} />
        </Card>
        <Card className="animate-in">
          <SectionTitle
            title="Poids du corps"
            subtitle={
              bmi !== null && bmiCat !== null
                ? `IMC ${bmi.toFixed(1)} · ${bmiCat.label}`
                : undefined
            }
          />
          <LineChart points={bwPoints} unit=" kg" />
        </Card>
      </div>

      <Card className="animate-in">
        <SectionTitle title="Activité récente" />
        {recent.length === 0 ? (
          <EmptyState text="Commence par ajouter une séance ou un repas." />
        ) : (
          <div className="grid gap-2">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{ color: r.color, background: "var(--surface-2)" }}
                  >
                    {r.tag}
                  </span>
                  <span className="text-sm">{r.text}</span>
                </div>
                <span className="text-xs text-text-muted">{formatDate(r.date)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

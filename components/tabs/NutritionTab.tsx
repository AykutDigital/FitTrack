"use client";

import { useMemo, useState } from "react";
import { AppData, Meal } from "@/lib/types";
import { newId } from "@/lib/storage";
import { today, formatDate, formatNumber } from "@/lib/format";
import { caloriePoints, caloriesForDate } from "@/lib/stats";
import { BarChart } from "@/components/Charts";
import { Button, Card, EmptyState, Field, Input, SectionTitle } from "@/components/ui";

export function NutritionTab({
  data,
  update,
}: {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
}) {
  const [date, setDate] = useState(today());
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");

  const canAdd = name.trim() && Number(calories) > 0;

  const add = () => {
    if (!canAdd) return;
    const meal: Meal = {
      id: newId(),
      date,
      name: name.trim(),
      calories: Math.round(Number(calories)),
    };
    update((prev) => ({ ...prev, meals: [meal, ...prev.meals] }));
    setName("");
    setCalories("");
  };

  const remove = (id: string) =>
    update((prev) => ({ ...prev, meals: prev.meals.filter((m) => m.id !== id) }));

  const dayTotal = caloriesForDate(data.meals, date);
  const goal = data.calorieGoal || 0;
  const pct = goal > 0 ? Math.min((dayTotal / goal) * 100, 100) : 0;
  const remaining = goal - dayTotal;

  const dayMeals = useMemo(
    () => data.meals.filter((m) => m.date === date),
    [data.meals, date]
  );
  const chart = useMemo(() => caloriePoints(data.meals, 7), [data.meals]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="animate-in h-fit">
        <SectionTitle title="Ajouter un repas" subtitle="Nom et calories." />
        <div className="grid gap-3">
          <Field label="Aliment / repas">
            <Input
              placeholder="Poulet riz…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Calories (kcal)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Button onClick={add} disabled={!canAdd}>
            Ajouter
          </Button>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="animate-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total du {formatDate(date)}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatNumber(dayTotal)}{" "}
                <span className="text-base font-medium text-text-muted">
                  / {formatNumber(goal)} kcal
                </span>
              </p>
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: remaining >= 0 ? "var(--accent)" : "var(--danger)" }}
            >
              {remaining >= 0
                ? `${formatNumber(remaining)} kcal restantes`
                : `${formatNumber(-remaining)} kcal en trop`}
            </p>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: remaining >= 0 ? "var(--calorie)" : "var(--danger)",
              }}
            />
          </div>
        </Card>

        <Card className="animate-in">
          <SectionTitle title="7 derniers jours" subtitle="Ligne = objectif" />
          <BarChart points={chart} goal={goal} />
        </Card>

        <Card className="animate-in">
          <SectionTitle title={`Repas du ${formatDate(date)}`} />
          {dayMeals.length === 0 ? (
            <EmptyState text="Aucun repas pour cette date." />
          ) : (
            <div className="grid gap-2">
              {dayMeals.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3"
                >
                  <p className="font-semibold">{m.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-calorie">{formatNumber(m.calories)} kcal</span>
                    <button
                      onClick={() => remove(m.id)}
                      aria-label="Supprimer"
                      className="rounded-lg p-1.5 text-text-muted transition hover:bg-danger/10 hover:text-danger"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

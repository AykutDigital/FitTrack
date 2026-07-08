"use client";

import { useMemo, useState } from "react";
import { AppData, FoodItem, Meal } from "@/lib/types";
import { newId } from "@/lib/storage";
import { today, formatDate, formatNumber } from "@/lib/format";
import {
  caloriePoints,
  caloriesForDate,
  proteinForDate,
  proteinPoints,
} from "@/lib/stats";
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
  const [protein, setProtein] = useState("");
  const [saveToLib, setSaveToLib] = useState(false);

  const canAdd = name.trim() && Number(calories) > 0;

  /** Ajoute (ou met à jour) un aliment dans la bibliothèque, dédoublonné par nom. */
  const upsertFood = (foods: FoodItem[], food: Omit<FoodItem, "id">): FoodItem[] => {
    const key = food.name.trim().toLowerCase();
    const existing = foods.find((f) => f.name.trim().toLowerCase() === key);
    if (existing) {
      return foods.map((f) =>
        f.id === existing.id ? { ...f, calories: food.calories, protein: food.protein } : f
      );
    }
    return [{ ...food, id: newId() }, ...foods];
  };

  const add = () => {
    if (!canAdd) return;
    const cal = Math.round(Number(calories));
    const prot = Math.round(Number(protein) || 0);
    const meal: Meal = { id: newId(), date, name: name.trim(), calories: cal, protein: prot };
    update((prev) => ({
      ...prev,
      meals: [meal, ...prev.meals],
      foods: saveToLib
        ? upsertFood(prev.foods, { name: name.trim(), calories: cal, protein: prot })
        : prev.foods,
    }));
    setName("");
    setCalories("");
    setProtein("");
    setSaveToLib(false);
  };

  /** Ajoute directement un repas à la date sélectionnée depuis un aliment enregistré. */
  const addFromFood = (food: FoodItem) => {
    const meal: Meal = {
      id: newId(),
      date,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
    };
    update((prev) => ({ ...prev, meals: [meal, ...prev.meals] }));
  };

  const removeFood = (id: string) =>
    update((prev) => ({ ...prev, foods: prev.foods.filter((f) => f.id !== id) }));

  const remove = (id: string) =>
    update((prev) => ({ ...prev, meals: prev.meals.filter((m) => m.id !== id) }));

  const dayCal = caloriesForDate(data.meals, date);
  const dayProt = proteinForDate(data.meals, date);
  const goal = data.calorieGoal || 0;
  const protGoal = data.proteinGoal || 0;
  const pct = goal > 0 ? Math.min((dayCal / goal) * 100, 100) : 0;
  const protPct = protGoal > 0 ? Math.min((dayProt / protGoal) * 100, 100) : 0;
  const remaining = goal - dayCal;

  const dayMeals = useMemo(
    () => data.meals.filter((m) => m.date === date),
    [data.meals, date]
  );
  const calChart = useMemo(() => caloriePoints(data.meals, 7), [data.meals]);
  const protChart = useMemo(() => proteinPoints(data.meals, 7), [data.meals]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="grid h-fit gap-6">
        <Card className="animate-in">
          <SectionTitle title="Ajouter un repas" subtitle="Nom, calories et protéines." />
          <div className="grid gap-3">
            <Field label="Aliment / repas">
              <Input
                placeholder="Poulet riz…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Calories (kcal)">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </Field>
              <Field label="Protéines (g)">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={saveToLib}
                onChange={(e) => setSaveToLib(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Enregistrer dans mes aliments habituels
            </label>
            <Button onClick={add} disabled={!canAdd}>
              Ajouter
            </Button>
          </div>
        </Card>

        <Card className="animate-in">
          <SectionTitle
            title="Mes aliments"
            subtitle="Clique pour ajouter au jour choisi."
          />
          {data.foods.length === 0 ? (
            <EmptyState text="Coche « Enregistrer » en ajoutant un repas pour le retrouver ici." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.foods.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-1 rounded-xl border border-border bg-bg py-1.5 pl-3 pr-1"
                >
                  <button
                    onClick={() => addFromFood(f)}
                    className="flex items-baseline gap-2 text-sm"
                    title="Ajouter au jour sélectionné"
                  >
                    <span className="font-semibold">{f.name}</span>
                    <span className="text-xs text-text-muted">
                      {formatNumber(f.calories)} kcal · {f.protein} g
                    </span>
                  </button>
                  <button
                    onClick={() => removeFood(f.id)}
                    aria-label="Retirer de mes aliments"
                    className="rounded-lg p-1 text-text-muted transition hover:bg-danger/10 hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="animate-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total du {formatDate(date)}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatNumber(dayCal)}{" "}
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

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-text-muted">Protéines</p>
            <p className="text-sm font-semibold">
              <span className="text-protein">{formatNumber(dayProt)}</span>
              <span className="font-medium text-text-muted"> / {formatNumber(protGoal)} g</span>
            </p>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${protPct}%`, background: "var(--protein)" }}
            />
          </div>
        </Card>

        <Card className="animate-in">
          <SectionTitle title="Calories · 7 jours" subtitle="Ligne = objectif" />
          <BarChart points={calChart} goal={goal} />
        </Card>

        <Card className="animate-in">
          <SectionTitle title="Protéines · 7 jours" subtitle="Ligne = objectif" />
          <BarChart points={protChart} goal={protGoal} color="var(--protein)" />
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
                    <span className="font-semibold text-protein">{m.protein} g</span>
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

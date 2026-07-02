"use client";

import { useMemo, useState } from "react";
import { AppData, BodyWeight } from "@/lib/types";
import { newId } from "@/lib/storage";
import { today, formatDate, formatDateShort } from "@/lib/format";
import { bmiCategory, computeBMI } from "@/lib/stats";
import { LineChart, Point } from "@/components/Charts";
import { Button, Card, EmptyState, Field, Input, SectionTitle } from "@/components/ui";

export function WeightTab({
  data,
  update,
}: {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
}) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");

  const canAdd = Number(weight) > 0;

  const add = () => {
    if (!canAdd) return;
    const entry: BodyWeight = { id: newId(), date, weight: Number(weight) };
    update((prev) => ({
      // remplace une éventuelle pesée du même jour
      ...prev,
      bodyWeights: [entry, ...prev.bodyWeights.filter((b) => b.date !== date)],
    }));
    setWeight("");
  };

  const remove = (id: string) =>
    update((prev) => ({
      ...prev,
      bodyWeights: prev.bodyWeights.filter((b) => b.id !== id),
    }));

  const sorted = useMemo(
    () => [...data.bodyWeights].sort((a, b) => b.date.localeCompare(a.date)),
    [data.bodyWeights]
  );

  const points: Point[] = useMemo(
    () =>
      [...data.bodyWeights]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((b) => ({ label: formatDateShort(b.date), value: b.weight })),
    [data.bodyWeights]
  );

  const latest = sorted[0]?.weight;
  const first = points[0]?.value;
  const delta = latest !== undefined && first !== undefined ? latest - first : 0;

  const setHeight = (v: string) =>
    update((prev) => ({ ...prev, height: Math.max(0, Number(v) || 0) }));

  const bmi = computeBMI(latest, data.height);
  const cat = bmi !== null ? bmiCategory(bmi) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="animate-in h-fit">
        <SectionTitle title="Nouvelle pesée" subtitle="Poids du corps." />
        <div className="grid gap-3">
          <Field label="Poids (kg)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              placeholder="75.4"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Button onClick={add} disabled={!canAdd}>
            Enregistrer
          </Button>

          <div className="mt-1 border-t border-border pt-4">
            <Field label="Ta taille (cm) — pour l'IMC">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="178"
                value={data.height || ""}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="animate-in">
          <SectionTitle title="IMC" subtitle="Indice de masse corporelle (OMS)" />
          {bmi === null || cat === null ? (
            <EmptyState
              text={
                !data.height
                  ? "Renseigne ta taille pour calculer ton IMC."
                  : "Ajoute une pesée pour calculer ton IMC."
              }
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight" style={{ color: cat.color }}>
                    {bmi.toFixed(1)}
                  </span>
                  <span className="text-sm text-text-muted">kg/m²</span>
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: cat.color }}>
                  {cat.label}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {latest} kg · {data.height} cm
                </p>
              </div>
              <BmiScale bmi={bmi} />
            </div>
          )}
        </Card>

        <Card className="animate-in">
          <SectionTitle
            title="Évolution du poids"
            subtitle={
              latest !== undefined
                ? `Actuel : ${latest} kg${
                    delta !== 0
                      ? ` · ${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg depuis le début`
                      : ""
                  }`
                : undefined
            }
          />
          <LineChart points={points} unit=" kg" />
        </Card>

        <Card className="animate-in">
          <SectionTitle title="Historique" />
          {sorted.length === 0 ? (
            <EmptyState text="Enregistre ta première pesée." />
          ) : (
            <div className="grid gap-2">
              {sorted.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3"
                >
                  <p className="text-sm text-text-muted">{formatDate(b.date)}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-accent">{b.weight} kg</span>
                    <button
                      onClick={() => remove(b.id)}
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

/** Petite jauge visuelle situant l'IMC sur l'échelle 15 → 40. */
function BmiScale({ bmi }: { bmi: number }) {
  const min = 15;
  const max = 40;
  const pct = Math.min(Math.max(((bmi - min) / (max - min)) * 100, 0), 100);
  return (
    <div className="w-full min-w-[180px] max-w-[260px]">
      <div
        className="relative h-2.5 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--calorie) 0%, var(--accent) 30%, var(--accent) 40%, var(--calorie) 60%, var(--danger) 100%)",
        }}
      >
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-text"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-text-muted">
        <span>15</span>
        <span>18,5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  );
}

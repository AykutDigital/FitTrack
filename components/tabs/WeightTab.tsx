"use client";

import { useMemo, useState } from "react";
import { AppData, BodyWeight } from "@/lib/types";
import { newId } from "@/lib/storage";
import { today, formatDate, formatDateShort } from "@/lib/format";
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
        </div>
      </Card>

      <div className="grid gap-6">
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

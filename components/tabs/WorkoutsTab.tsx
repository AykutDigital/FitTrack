"use client";

import { useMemo, useState } from "react";
import { AppData, Workout } from "@/lib/types";
import { newId } from "@/lib/storage";
import { today, formatDate } from "@/lib/format";
import { exerciseNames, exerciseProgress } from "@/lib/stats";
import { LineChart } from "@/components/Charts";
import { Button, Card, EmptyState, Field, Input, SectionTitle } from "@/components/ui";

export function WorkoutsTab({
  data,
  update,
}: {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
}) {
  const [date, setDate] = useState(today());
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");

  const names = exerciseNames(data);
  const [selected, setSelected] = useState<string>("");
  const chartExercise = selected || names[0] || "";
  const progress = useMemo(
    () => exerciseProgress(data, chartExercise),
    [data, chartExercise]
  );

  const canAdd = exercise.trim() && Number(weight) >= 0 && Number(reps) > 0;

  const add = () => {
    if (!canAdd) return;
    const entry: Workout = {
      id: newId(),
      date,
      exercise: exercise.trim(),
      weight: Number(weight) || 0,
      reps: Number(reps) || 0,
      sets: Number(sets) || 1,
    };
    update((prev) => ({ ...prev, workouts: [entry, ...prev.workouts] }));
    setExercise("");
    setWeight("");
    setReps("");
    setSets("");
  };

  const remove = (id: string) =>
    update((prev) => ({ ...prev, workouts: prev.workouts.filter((w) => w.id !== id) }));

  const grouped = useMemo(() => groupByDate(data.workouts), [data.workouts]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="animate-in h-fit">
        <SectionTitle title="Ajouter une série" subtitle="Ta charge, tes reps." />
        <div className="grid gap-3">
          <Field label="Exercice">
            <Input
              list="exercise-list"
              placeholder="Développé couché…"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
            />
            <datalist id="exercise-list">
              {names.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Charge (kg)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Field>
            <Field label="Reps">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </Field>
            <Field label="Séries">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Button onClick={add} disabled={!canAdd}>
            Ajouter
          </Button>
        </div>
      </Card>

      <div className="grid gap-6">
        {names.length > 0 && (
          <Card className="animate-in">
            <SectionTitle
              title="Progression"
              subtitle="Charge max par séance"
              action={
                <select
                  value={chartExercise}
                  onChange={(e) => setSelected(e.target.value)}
                  className="rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              }
            />
            <LineChart points={progress} unit=" kg" />
          </Card>
        )}

        <Card className="animate-in">
          <SectionTitle title="Historique" />
          {data.workouts.length === 0 ? (
            <EmptyState text="Ajoute ta première série pour la voir ici." />
          ) : (
            <div className="grid gap-5">
              {grouped.map(([d, items]) => (
                <div key={d}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {formatDate(d)}
                  </p>
                  <div className="grid gap-2">
                    {items.map((w) => (
                      <Row key={w.id} w={w} onDelete={() => remove(w.id)} />
                    ))}
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

function Row({ w, onDelete }: { w: Workout; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">
      <div>
        <p className="font-semibold">{w.exercise}</p>
        <p className="text-sm text-text-muted">
          {w.sets} × {w.reps} reps
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-accent">{w.weight} kg</span>
        <button
          onClick={onDelete}
          aria-label="Supprimer"
          className="rounded-lg p-1.5 text-text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function groupByDate(workouts: Workout[]): [string, Workout[]][] {
  const map = new Map<string, Workout[]>();
  for (const w of workouts) {
    const arr = map.get(w.date) ?? [];
    arr.push(w);
    map.set(w.date, arr);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

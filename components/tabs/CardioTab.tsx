"use client";

import { useMemo, useState } from "react";
import { AppData, Cardio, Intensity } from "@/lib/types";
import { newId } from "@/lib/storage";
import { today, formatDate, formatNumber } from "@/lib/format";
import {
  CARDIO_ACTIVITIES,
  INTENSITIES,
  cardioMinutePoints,
  estimateCardioCalories,
  latestBodyWeight,
} from "@/lib/stats";
import { BarChart } from "@/components/Charts";
import { Button, Card, EmptyState, Field, Input, SectionTitle } from "@/components/ui";

const selectClass =
  "w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function CardioTab({
  data,
  update,
}: {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
}) {
  const [date, setDate] = useState(today());
  const [activity, setActivity] = useState("Vélo");
  const [intensity, setIntensity] = useState<Intensity>("modérée");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [speed, setSpeed] = useState("");

  const weight = latestBodyWeight(data);
  const dur = Number(duration);
  const canAdd = activity.trim() && dur > 0;

  // aperçu live des calories estimées
  const previewCal =
    canAdd ? estimateCardioCalories(activity.trim(), intensity, dur, weight) : 0;

  const add = () => {
    if (!canAdd) return;
    const dist = Number(distance) || undefined;
    let spd = Number(speed) || undefined;
    // vitesse auto si distance fournie sans vitesse
    if (!spd && dist && dur > 0) spd = Math.round((dist / (dur / 60)) * 10) / 10;

    const entry: Cardio = {
      id: newId(),
      date,
      activity: activity.trim(),
      duration: dur,
      distance: dist,
      speed: spd,
      intensity,
      calories: estimateCardioCalories(activity.trim(), intensity, dur, weight),
    };
    update((prev) => ({ ...prev, cardio: [entry, ...prev.cardio] }));
    setDuration("");
    setDistance("");
    setSpeed("");
  };

  const remove = (id: string) =>
    update((prev) => ({ ...prev, cardio: prev.cardio.filter((c) => c.id !== id) }));

  const chart = useMemo(() => cardioMinutePoints(data.cardio, 7), [data.cardio]);
  const grouped = useMemo(() => groupByDate(data.cardio), [data.cardio]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="animate-in h-fit">
        <SectionTitle title="Ajouter une séance" subtitle="Vélo, course, rameur…" />
        <div className="grid gap-3">
          <Field label="Activité">
            <input
              list="cardio-activities"
              className={selectClass}
              placeholder="Vélo…"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
            <datalist id="cardio-activities">
              {CARDIO_ACTIVITIES.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>

          <Field label="Intensité">
            <select
              className={selectClass}
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as Intensity)}
            >
              {INTENSITIES.map((i) => (
                <option key={i} value={i}>
                  {cap(i)}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Durée (min)">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Field>
            <Field label="Distance (km)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </Field>
            <Field label="Vitesse (km/h)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                placeholder="auto"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          {canAdd && (
            <p className="text-xs text-text-muted">
              ≈ <span className="font-semibold text-calorie">{formatNumber(previewCal)} kcal</span>{" "}
              brûlées {weight ? `(${weight} kg)` : "(poids par défaut 70 kg)"}
            </p>
          )}

          <Button onClick={add} disabled={!canAdd}>
            Ajouter
          </Button>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="animate-in">
          <SectionTitle title="Cardio · 7 jours" subtitle="Minutes par jour" />
          <BarChart points={chart} color="var(--accent)" />
        </Card>

        <Card className="animate-in">
          <SectionTitle title="Historique" />
          {data.cardio.length === 0 ? (
            <EmptyState text="Ajoute ta première séance de cardio." />
          ) : (
            <div className="grid gap-5">
              {grouped.map(([d, items]) => (
                <div key={d}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {formatDate(d)}
                  </p>
                  <div className="grid gap-2">
                    {items.map((c) => (
                      <Row key={c.id} c={c} onDelete={() => remove(c.id)} />
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

function Row({ c, onDelete }: { c: Cardio; onDelete: () => void }) {
  const details = [
    `${c.duration} min`,
    c.distance ? `${c.distance} km` : null,
    c.speed ? `${c.speed} km/h` : null,
    cap(c.intensity),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">
      <div>
        <p className="font-semibold">{c.activity}</p>
        <p className="text-sm text-text-muted">{details}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-calorie">{formatNumber(c.calories)} kcal</span>
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

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function groupByDate(cardio: Cardio[]): [string, Cardio[]][] {
  const map = new Map<string, Cardio[]>();
  for (const c of cardio) {
    const arr = map.get(c.date) ?? [];
    arr.push(c);
    map.set(c.date, arr);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

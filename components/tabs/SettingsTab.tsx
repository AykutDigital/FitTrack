"use client";

import { useRef, useState } from "react";
import { AppData, EMPTY_DATA } from "@/lib/types";
import { Button, Card, Field, Input, SectionTitle } from "@/components/ui";

export function SettingsTab({
  data,
  update,
  replaceAll,
}: {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
  replaceAll: (next: AppData) => void;
}) {
  const [goal, setGoal] = useState(String(data.calorieGoal));
  const [protGoal, setProtGoal] = useState(String(data.proteinGoal));
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveGoal = () => {
    const cal = Math.max(0, Math.round(Number(goal) || 0));
    const prot = Math.max(0, Math.round(Number(protGoal) || 0));
    update((prev) => ({ ...prev, calorieGoal: cal, proteinGoal: prot }));
    flash("Objectifs enregistrés.");
  };

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fittrack-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppData>;
        replaceAll({
          ...EMPTY_DATA,
          ...parsed,
          workouts: parsed.workouts ?? [],
          meals: parsed.meals ?? [],
          cardio: parsed.cardio ?? [],
          bodyWeights: parsed.bodyWeights ?? [],
          foods: parsed.foods ?? [],
        });
        flash("Données importées.");
      } catch {
        flash("Fichier invalide.");
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (confirm("Effacer toutes les données ? Cette action est irréversible.")) {
      replaceAll(EMPTY_DATA);
      setGoal(String(EMPTY_DATA.calorieGoal));
      setProtGoal(String(EMPTY_DATA.proteinGoal));
      flash("Toutes les données ont été effacées.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="animate-in h-fit">
        <SectionTitle title="Objectifs quotidiens" subtitle="Calories et protéines visées par jour." />
        <div className="flex items-end gap-3">
          <Field label="kcal / jour">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </Field>
          <Field label="protéines (g) / jour">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={protGoal}
              onChange={(e) => setProtGoal(e.target.value)}
            />
          </Field>
          <Button onClick={saveGoal}>Enregistrer</Button>
        </div>
      </Card>

      <Card className="animate-in h-fit">
        <SectionTitle
          title="Sauvegarde"
          subtitle="Tes données restent sur cet appareil."
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={exportData}>
            Exporter (JSON)
          </Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            Importer
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
          <Button variant="danger" onClick={clearAll}>
            Tout effacer
          </Button>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          {data.workouts.length} séries · {data.meals.length} repas ·{" "}
          {data.cardio.length} cardio · {data.bodyWeights.length} pesées ·{" "}
          {data.foods.length} aliments enregistrés.
        </p>
      </Card>

      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          {msg}
        </div>
      )}
    </div>
  );
}

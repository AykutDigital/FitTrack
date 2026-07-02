"use client";

import { useState } from "react";
import { useAppData } from "@/lib/storage";
import { useTheme } from "@/components/theme";
import { Dashboard } from "@/components/tabs/Dashboard";
import { WorkoutsTab } from "@/components/tabs/WorkoutsTab";
import { NutritionTab } from "@/components/tabs/NutritionTab";
import { WeightTab } from "@/components/tabs/WeightTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";

const TABS = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "workouts", label: "Entraînements" },
  { id: "nutrition", label: "Nutrition" },
  { id: "weight", label: "Poids" },
  { id: "settings", label: "Réglages" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const { data, update, replaceAll, loaded } = useAppData();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">
            F
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">FitTrack</h1>
            <p className="-mt-0.5 text-xs text-text-muted">Muscu &amp; calories</p>
          </div>
        </div>
        <button
          onClick={toggle}
          aria-label="Changer de thème"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm transition hover:bg-surface-2"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <nav className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-accent text-white"
                : "text-text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {!loaded ? (
        <div className="py-24 text-center text-sm text-text-muted">Chargement…</div>
      ) : (
        <div key={tab}>
          {tab === "dashboard" && <Dashboard data={data} />}
          {tab === "workouts" && <WorkoutsTab data={data} update={update} />}
          {tab === "nutrition" && <NutritionTab data={data} update={update} />}
          {tab === "weight" && <WeightTab data={data} update={update} />}
          {tab === "settings" && (
            <SettingsTab data={data} update={update} replaceAll={replaceAll} />
          )}
        </div>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DataApi, useCloudData, useLocalData } from "@/lib/storage";
import { useAuth, signOut } from "@/lib/auth";
import { useTheme } from "@/components/theme";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/tabs/Dashboard";
import { WorkoutsTab } from "@/components/tabs/WorkoutsTab";
import { CardioTab } from "@/components/tabs/CardioTab";
import { NutritionTab } from "@/components/tabs/NutritionTab";
import { WeightTab } from "@/components/tabs/WeightTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";

const TABS = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "workouts", label: "Entraînements" },
  { id: "cardio", label: "Cardio" },
  { id: "nutrition", label: "Nutrition" },
  { id: "weight", label: "Poids" },
  { id: "settings", label: "Réglages" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Account = { email: string; syncing?: boolean; onSignOut: () => void } | null;

export default function Home() {
  // isSupabaseConfigured est une constante (issue des variables d'env),
  // stable entre les rendus : le branchement est sûr pour les hooks.
  return isSupabaseConfigured ? <CloudApp /> : <LocalApp />;
}

function LocalApp() {
  const api = useLocalData();
  return <AppShell api={api} account={null} />;
}

function CloudApp() {
  const { user, loading } = useAuth();
  const api = useCloudData(user?.id ?? null);

  if (loading) {
    return <FullscreenNote text="Chargement…" />;
  }
  if (!user) {
    return <AuthScreen />;
  }
  return (
    <AppShell
      api={api}
      account={{
        email: user.email ?? "compte",
        syncing: api.syncing,
        onSignOut: () => signOut(),
      }}
    />
  );
}

function AppShell({ api, account }: { api: DataApi; account: Account }) {
  const { data, update, replaceAll, loaded } = api;
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">
            F
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">FitTrack</h1>
            <p className="-mt-0.5 text-xs text-text-muted">Muscu &amp; calories</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {account && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[160px] truncate text-xs text-text-muted">
                {account.syncing ? "Synchro…" : account.email}
              </span>
              <button
                onClick={account.onSignOut}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-sm transition hover:bg-surface-2"
              >
                Déconnexion
              </button>
            </div>
          )}
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm transition hover:bg-surface-2"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
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
          {tab === "cardio" && <CardioTab data={data} update={update} />}
          {tab === "nutrition" && <NutritionTab data={data} update={update} />}
          {tab === "weight" && <WeightTab data={data} update={update} />}
          {tab === "settings" && (
            <SettingsTab
              data={data}
              update={update}
              replaceAll={replaceAll}
              account={account ? { email: account.email, onSignOut: account.onSignOut } : null}
            />
          )}
        </div>
      )}
    </main>
  );
}

function FullscreenNote({ text }: { text: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center text-sm text-text-muted">
      {text}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppData, EMPTY_DATA } from "./types";
import { supabase, DATA_TABLE } from "./supabase";

const STORAGE_KEY = "fittrack:data:v1";

/** Complète les données avec les valeurs par défaut (champs ajoutés récemment). */
function withDefaults(partial: Partial<AppData> | null | undefined): AppData {
  return {
    ...EMPTY_DATA,
    ...partial,
    workouts: partial?.workouts ?? [],
    meals: partial?.meals ?? [],
    cardio: partial?.cardio ?? [],
    bodyWeights: partial?.bodyWeights ?? [],
  };
}

function readLocal(): AppData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? withDefaults(JSON.parse(raw)) : EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

function isEmpty(d: AppData): boolean {
  return (
    d.workouts.length === 0 &&
    d.meals.length === 0 &&
    d.cardio.length === 0 &&
    d.bodyWeights.length === 0
  );
}

export type DataApi = {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
  replaceAll: (next: AppData) => void;
  loaded: boolean;
  /** état de synchro cloud, pour un éventuel indicateur */
  syncing?: boolean;
};

/**
 * Mode local : données dans localStorage (pas de compte).
 */
export function useLocalData(): DataApi {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(readLocal());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota / indisponible */
    }
  }, [data, loaded]);

  const update = useCallback(
    (fn: (prev: AppData) => AppData) => setData((p) => fn(p)),
    []
  );
  const replaceAll = useCallback((next: AppData) => setData(next), []);

  return { data, update, replaceAll, loaded };
}

/**
 * Mode compte : données synchronisées avec Supabase (une ligne par utilisateur).
 * Première connexion : si le cloud est vide mais qu'il y a des données locales,
 * on les migre automatiquement vers le compte.
 */
export function useCloudData(userId: string | null): DataApi {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // chargement initial depuis le cloud
  useEffect(() => {
    if (!userId || !supabase) {
      setLoaded(false);
      return;
    }
    let active = true;
    setLoaded(false);
    (async () => {
      const { data: row } = await supabase
        .from(DATA_TABLE)
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (!active) return;

      if (row?.data) {
        setData(withDefaults(row.data as Partial<AppData>));
      } else {
        // pas encore de données cloud : on récupère l'éventuel local
        const local = readLocal();
        setData(isEmpty(local) ? EMPTY_DATA : local);
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  // sauvegarde (debounced) vers le cloud
  useEffect(() => {
    if (!userId || !supabase || !loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncing(true);
    saveTimer.current = setTimeout(async () => {
      await supabase!
        .from(DATA_TABLE)
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
      setSyncing(false);
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, userId, loaded]);

  const update = useCallback(
    (fn: (prev: AppData) => AppData) => setData((p) => fn(p)),
    []
  );
  const replaceAll = useCallback((next: AppData) => setData(next), []);

  return { data, update, replaceAll, loaded, syncing };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export { STORAGE_KEY, withDefaults };

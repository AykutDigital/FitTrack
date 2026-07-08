"use client";

import { useCallback, useEffect, useState } from "react";
import { AppData, EMPTY_DATA } from "./types";

const STORAGE_KEY = "fittrack:data:v1";

function readStorage(): AppData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...EMPTY_DATA,
      ...parsed,
      workouts: parsed.workouts ?? [],
      meals: parsed.meals ?? [],
      cardio: parsed.cardio ?? [],
      bodyWeights: parsed.bodyWeights ?? [],
      foods: parsed.foods ?? [],
    };
  } catch {
    return EMPTY_DATA;
  }
}

/**
 * Hook central : lit/écrit toutes les données de l'app dans localStorage.
 * `loaded` évite le flash d'hydratation (SSR renvoie les données vides).
 */
export function useAppData() {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(readStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota dépassé ou stockage indisponible */
    }
  }, [data, loaded]);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const replaceAll = useCallback((next: AppData) => setData(next), []);

  return { data, update, replaceAll, loaded };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export { STORAGE_KEY };

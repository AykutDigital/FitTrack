import { AppData, Cardio, Intensity, Meal } from "./types";
import { formatDateShort, today } from "./format";
import { Point } from "@/components/Charts";

/** Somme des calories pour une date donnée. */
export function caloriesForDate(meals: Meal[], date: string): number {
  return meals
    .filter((m) => m.date === date)
    .reduce((sum, m) => sum + m.calories, 0);
}

/** Les N derniers jours (du plus ancien au plus récent) au format yyyy-mm-dd. */
export function lastNDays(n: number): string[] {
  const base = new Date(today() + "T00:00:00");
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const tz = d.getTimezoneOffset() * 60000;
    days.push(new Date(d.getTime() - tz).toISOString().slice(0, 10));
  }
  return days;
}

/** Points calories/jour pour le graphe en barres. */
export function caloriePoints(meals: Meal[], n: number): Point[] {
  return lastNDays(n).map((d) => ({
    label: formatDateShort(d),
    value: caloriesForDate(meals, d),
  }));
}

/** Somme des protéines (g) pour une date donnée. */
export function proteinForDate(meals: Meal[], date: string): number {
  return meals
    .filter((m) => m.date === date)
    .reduce((sum, m) => sum + (m.protein || 0), 0);
}

/** Points protéines/jour pour le graphe en barres. */
export function proteinPoints(meals: Meal[], n: number): Point[] {
  return lastNDays(n).map((d) => ({
    label: formatDateShort(d),
    value: proteinForDate(meals, d),
  }));
}

/** Nombre d'entraînements sur les 7 derniers jours. */
export function workoutsThisWeek(data: AppData): number {
  const days = new Set(lastNDays(7));
  return data.workouts.filter((w) => days.has(w.date)).length;
}

/** Liste unique des exercices déjà saisis. */
export function exerciseNames(data: AppData): string[] {
  return Array.from(new Set(data.workouts.map((w) => w.exercise))).sort((a, b) =>
    a.localeCompare(b, "fr")
  );
}

/** Activités cardio proposées. */
export const CARDIO_ACTIVITIES = [
  "Vélo",
  "Course",
  "Marche",
  "Rameur",
  "Elliptique",
  "Natation",
  "Corde à sauter",
] as const;

export const INTENSITIES: Intensity[] = ["faible", "modérée", "élevée"];

/** Valeurs MET (équivalent métabolique) par activité et intensité. */
const MET_TABLE: Record<string, Record<Intensity, number>> = {
  Vélo: { faible: 4, modérée: 8, élevée: 10 },
  Course: { faible: 7, modérée: 9.8, élevée: 12.5 },
  Marche: { faible: 2.8, modérée: 3.8, élevée: 5 },
  Rameur: { faible: 4.8, modérée: 7, élevée: 10 },
  Elliptique: { faible: 5, modérée: 7, élevée: 9 },
  Natation: { faible: 5, modérée: 7, élevée: 10 },
  "Corde à sauter": { faible: 8, modérée: 10, élevée: 12 },
};

const DEFAULT_MET: Record<Intensity, number> = { faible: 4, modérée: 7, élevée: 9 };

/**
 * Estime les calories brûlées : kcal = MET × poids(kg) × durée(h).
 * Utilise 70 kg par défaut si aucun poids n'est connu.
 */
export function estimateCardioCalories(
  activity: string,
  intensity: Intensity,
  minutes: number,
  weightKg?: number
): number {
  const met = (MET_TABLE[activity] ?? DEFAULT_MET)[intensity];
  const w = weightKg && weightKg > 0 ? weightKg : 70;
  return Math.round(met * w * (minutes / 60));
}

/** Dernier poids du corps connu (kg), ou undefined. */
export function latestBodyWeight(data: AppData): number | undefined {
  return [...data.bodyWeights].sort((a, b) => a.date.localeCompare(b.date)).pop()
    ?.weight;
}

/** Minutes de cardio par jour sur les N derniers jours. */
export function cardioMinutePoints(cardio: Cardio[], n: number): Point[] {
  const byDate = new Map<string, number>();
  for (const c of cardio) byDate.set(c.date, (byDate.get(c.date) ?? 0) + c.duration);
  return lastNDays(n).map((d) => ({
    label: formatDateShort(d),
    value: byDate.get(d) ?? 0,
  }));
}

/** Minutes totales de cardio sur les 7 derniers jours. */
export function cardioMinutesThisWeek(data: AppData): number {
  const days = new Set(lastNDays(7));
  return data.cardio
    .filter((c) => days.has(c.date))
    .reduce((sum, c) => sum + c.duration, 0);
}

/** IMC = poids (kg) / taille² (m). null si données manquantes. */
export function computeBMI(weightKg?: number, heightCm?: number): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export type BMIInfo = { label: string; color: string };

/** Catégorie OMS de l'IMC avec couleur associée. */
export function bmiCategory(bmi: number): BMIInfo {
  if (bmi < 18.5) return { label: "Insuffisance pondérale", color: "var(--calorie)" };
  if (bmi < 25) return { label: "Corpulence normale", color: "var(--accent)" };
  if (bmi < 30) return { label: "Surpoids", color: "var(--calorie)" };
  if (bmi < 35) return { label: "Obésité modérée", color: "var(--danger)" };
  if (bmi < 40) return { label: "Obésité sévère", color: "var(--danger)" };
  return { label: "Obésité morbide", color: "var(--danger)" };
}

/** Progression : charge max par jour pour un exercice (ancien → récent). */
export function exerciseProgress(data: AppData, exercise: string): Point[] {
  const byDate = new Map<string, number>();
  for (const w of data.workouts) {
    if (w.exercise !== exercise) continue;
    byDate.set(w.date, Math.max(byDate.get(w.date) ?? 0, w.weight));
  }
  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ label: formatDateShort(date), value }));
}

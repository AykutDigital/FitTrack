import { AppData, Meal } from "./types";
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

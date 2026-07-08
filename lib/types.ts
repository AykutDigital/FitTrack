export type Workout = {
  id: string;
  /** ISO date, format yyyy-mm-dd */
  date: string;
  exercise: string;
  /** charge en kg */
  weight: number;
  reps: number;
  sets: number;
  note?: string;
};

export type Meal = {
  id: string;
  /** ISO date, format yyyy-mm-dd */
  date: string;
  name: string;
  calories: number;
  /** protéines en grammes */
  protein: number;
};

/** Aliment enregistré dans la bibliothèque (« aliments habituels »). */
export type FoodItem = {
  id: string;
  name: string;
  /** calories pour une portion (kcal) */
  calories: number;
  /** protéines pour une portion (g) */
  protein: number;
};

export type Intensity = "faible" | "modérée" | "élevée";

export type Cardio = {
  id: string;
  /** ISO date, format yyyy-mm-dd */
  date: string;
  activity: string;
  /** durée en minutes */
  duration: number;
  /** distance en km (optionnel) */
  distance?: number;
  /** vitesse moyenne en km/h (optionnel) */
  speed?: number;
  intensity: Intensity;
  /** estimation des calories brûlées (kcal) */
  calories: number;
};

export type BodyWeight = {
  id: string;
  /** ISO date, format yyyy-mm-dd */
  date: string;
  /** poids du corps en kg */
  weight: number;
};

export type AppData = {
  workouts: Workout[];
  meals: Meal[];
  cardio: Cardio[];
  bodyWeights: BodyWeight[];
  /** bibliothèque d'aliments habituels */
  foods: FoodItem[];
  /** objectif calorique quotidien */
  calorieGoal: number;
  /** objectif protéines quotidien (g) */
  proteinGoal: number;
  /** taille en cm (pour le calcul de l'IMC) */
  height: number;
};

export const EMPTY_DATA: AppData = {
  workouts: [],
  meals: [],
  cardio: [],
  bodyWeights: [],
  foods: [],
  calorieGoal: 2200,
  proteinGoal: 140,
  height: 0,
};

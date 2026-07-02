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
  bodyWeights: BodyWeight[];
  /** objectif calorique quotidien */
  calorieGoal: number;
  /** taille en cm (pour le calcul de l'IMC) */
  height: number;
};

export const EMPTY_DATA: AppData = {
  workouts: [],
  meals: [],
  bodyWeights: [],
  calorieGoal: 2200,
  height: 0,
};

# FitTrack — Feuille de route

Suivi de ce qui est fait et de ce qu'il reste à faire.

## ✅ Fait — Nutrition avancée (local, localStorage)

- **Protéines par repas** : champ `protein` (g) sur chaque `Meal`, saisi à côté des calories.
- **Objectif protéines quotidien** : réglable dans _Réglages_, à côté de l'objectif calorique (`proteinGoal`, défaut 140 g).
- **Graphiques 7 jours** dans l'onglet _Nutrition_ : calories (barres + ligne d'objectif) et protéines (barres + ligne d'objectif), + barres de progression du jour.
- **Bibliothèque d'aliments habituels** :
  - Case « Enregistrer dans mes aliments habituels » à l'ajout d'un repas (dédoublonné par nom, mis à jour si re-saisi).
  - Carte « Mes aliments » : un clic sur un aliment = repas ajouté à la date choisie ; ✕ pour retirer.
  - Pris en compte dans l'export/import JSON et le compteur des _Réglages_.
- **Rétro-compatibilité** : anciennes sauvegardes chargées sans erreur (repas sans protéines = 0 g, bibliothèque vide, objectif protéines par défaut).

_Fichiers : `lib/types.ts`, `lib/storage.ts`, `lib/stats.ts`, `app/globals.css`, `components/tabs/{NutritionTab,SettingsTab,Dashboard}.tsx`._

## 🔜 À faire — Étape 2 : Supabase (comptes + synchro cloud)

Objectif : sauvegarder les données hors du navigateur et les synchroniser entre appareils (répond au besoin de longévité). Le code annulé au commit `f600ff0` est **partiellement réutilisable** (`git show f600ff0`).

Ce que ça implique :

1. **Côté toi (Benji)** : créer un projet sur [supabase.com], puis me fournir l'URL du projet + la clé `anon` (à mettre dans `.env.local`, jamais commité).
2. **Schéma SQL** : table(s) pour stocker les données par utilisateur (`user_id` + JSON `data`, ou tables normalisées workouts/meals/cardio/bodyWeights/foods). Réutiliser `supabase/schema.sql` de l'ancien commit.
3. **Auth** : écran de connexion (email + mot de passe, ou magic link). Réutiliser `components/AuthScreen.tsx` + `lib/auth.ts`.
4. **Client Supabase** : `lib/supabase.ts` (réutilisable) + ajouter la dépendance `@supabase/supabase-js`.
5. **Synchro** : adapter `lib/storage.ts` — repli sur localStorage si Supabase non configuré (comportement de l'ancien commit), chargement au login, écriture à chaque modification (avec debounce).
6. **Gestion des conflits** : stratégie simple « dernière écriture gagne » au début ; migration des données locales existantes vers le cloud à la première connexion.
7. **Sécurité** : activer la Row Level Security (RLS) pour que chaque utilisateur ne voie que ses données.

## 💡 Idées / améliorations futures (non prioritaires)

- Macros complètes : glucides + lipides par repas (choix « protéines seulement » pris pour l'instant).
- Quantités / portions (ex. « 150 g de poulet ») avec valeurs pour 100 g.
- Recherche dans une base d'aliments publique (OpenFoodFacts) pour préremplir kcal/protéines.
- Édition d'un aliment déjà enregistré (aujourd'hui : ajout/mise à jour par re-saisie, ou suppression).
- Objectif protéines affiché aussi sur le tableau de bord (StatCard dédiée).
- Mode PWA / hors-ligne installable.

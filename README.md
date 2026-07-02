# FitTrack 🏋️

Application de suivi de **musculation** (charges, reps, séries) et de **calories**, avec suivi du **poids du corps**.
Toutes les données sont stockées **en local dans le navigateur** (localStorage) — aucun compte, aucun serveur.

Construit avec **Next.js 16 + TypeScript + Tailwind CSS**. Le dossier `app` est à la racine (pas dans `src`).

## Fonctionnalités

- **Tableau de bord** : calories du jour, restant, poids actuel, séances de la semaine + graphiques.
- **Entraînements** : ajout de séries (exercice / charge / reps / séries) et courbe de progression par exercice.
- **Nutrition** : ajout de repas, objectif calorique, barre de progression et graphe 7 jours.
- **Poids** : pesées + courbe d'évolution.
- **Réglages** : objectif calorique, export/import JSON, réinitialisation. Thème clair/sombre.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:3000
```

Build de production : `npm run build` puis `npm start`.

## Déploiement

### 1. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit: FitTrack"
git branch -M main
git remote add origin https://github.com/<ton-user>/<ton-repo>.git
git push -u origin main
```

### 2. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Importe le dépôt GitHub.
3. Vercel détecte Next.js automatiquement — laisse les réglages par défaut et clique **Deploy**.

Aucune variable d'environnement n'est nécessaire (tout est en local côté client).

## Structure

```
app/                 # pages & layout (App Router, à la racine)
components/          # UI, graphiques, onglets
  tabs/
lib/                 # types, stockage localStorage, calculs, formatage
```

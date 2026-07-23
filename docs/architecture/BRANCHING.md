# Git Branching Strategy

Ce document définit la stratégie de branches utilisée dans le projet ITSM Platform, les conventions de nommage, les workflows associés, et les règles de merge.

## 1. Vue d'ensemble

```
main
│
├── develop
│   │
│   ├── feature/*
│   ├── bugfix/*
│   ├── release/*
└── hotfix/*
```

## 2. Rôle de chaque branche

| Branche | Rôle | Créée depuis | Fusionnée dans |
|---|---|---|---|
| `main` | Code en production, toujours stable et déployable | — | — |
| `develop` | Branche d'intégration, contient les dernières fonctionnalités validées | `main` | — |
| `feature/*` | Développement d'une nouvelle fonctionnalité | `develop` | `develop` |
| `bugfix/*` | Correction d'un bug non urgent détecté en développement | `develop` | `develop` |
| `release/*` | Stabilisation d'une version avant mise en production | `develop` | `main` + `develop` |
| `hotfix/*` | Correction urgente d'un bug critique en production | `main` | `main` + `develop` |

- **`main`** : reflète toujours l'état du code en production. Aucun commit direct — uniquement via merge depuis `release/*` ou `hotfix/*`.
- **`develop`** : reflète l'état du prochain développement à livrer. Reçoit les `feature/*` et `bugfix/*` validées.

## 3. Conventions de nommage

| Type | Format | Exemple |
|---|---|---|
| Feature | `feature/<description-courte>` | `feature/ticket-module` |
| Bugfix | `bugfix/<description-courte>` | `bugfix/login-error` |
| Release | `release/v<major>.<minor>.<patch>` | `release/v1.0.0` |
| Hotfix | `hotfix/<description-courte>` | `hotfix/critical-auth-bug` |

Règles :
- Toujours en minuscules, mots séparés par des tirets (`-`)
- Description courte et explicite (2-4 mots max)
- Pas d'espaces, pas d'accents, pas de caractères spéciaux

## 4. Workflow Feature Branch (`feature/*`)

```
develop ──●───────────────────●── (merge PR)
           \                 /
            ●──●──●──●──●──●
            feature/ticket-module
```

1. Créer la branche depuis `develop` à jour :
```
git checkout develop
git pull origin develop
git checkout -b feature/nom-de-la-feature
```
2. Développer, commiter régulièrement (commits atomiques, messages clairs)
3. Pousser la branche :
```
git push -u origin feature/nom-de-la-feature
```
4. Ouvrir une **Pull Request** vers `develop`
5. Revue de code (voir règles de merge, section 7)
6. Merge dans `develop`, puis suppression de la branche `feature/*`

Le même processus s'applique à `bugfix/*`.

## 5. Workflow Release Branch (`release/*`)

```
develop ──●───────────────●
           \               \
            ●──●──●──●      (release/v1.0.0)
main ─────────────────────●── (merge + tag v1.0.0)
develop ──────────────────●── (merge back)
```

1. Créer la branche depuis `develop` quand celui-ci est prêt à être livré :
```
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```
2. Phase de stabilisation : tests, corrections mineures uniquement (pas de nouvelles fonctionnalités)
3. Une fois validée :
   - Merge vers `main` via Pull Request, puis créer un tag de version (`v1.0.0`)
   - Merge (back-merge) vers `develop` pour propager les correctifs de la release
4. Suppression de la branche `release/*`

## 6. Workflow Hotfix Branch (`hotfix/*`)

```
main ──●───────────────────●── (merge + tag)
        \                 /
         ●──●──●──●──●──●
         hotfix/critical-auth-bug
develop ───────────────────●── (merge back)
```

1. Créer la branche depuis `main` (jamais depuis `develop`) :
```
git checkout main
git pull origin main
git checkout -b hotfix/description-du-bug
```
2. Corriger le bug critique, tester
3. Merge vers `main` via Pull Request + création d'un tag de version corrective (ex: `v1.0.1`)
4. Merge (back-merge) vers `develop` pour ne pas perdre le correctif
5. Suppression de la branche `hotfix/*`

## 7. Règles de merge et de revue

- **Pull Request obligatoire** pour merger dans `main` et `develop` — aucun push direct
- **Minimum 1 reviewer** requis avant merge (2 recommandés pour `main` si l'équipe grandit)
- **CI checks requis** avant merge (lint, tests) une fois la pipeline CI en place
- **Squash ou merge commit** : à privilégier au cas par cas selon la lisibilité de l'historique souhaitée
- Suppression systématique de la branche après merge (feature/bugfix/release/hotfix)
- Ces règles sont configurées dans GitHub via **Settings → Branches → Branch protection rules** sur `main` et `develop`

## 8. Résumé rapide

| Je veux... | Je pars de... | Je merge vers... |
|---|---|---|
| Développer une fonctionnalité | `develop` | `develop` |
| Corriger un bug non urgent | `develop` | `develop` |
| Préparer une version | `develop` | `main` + `develop` |
| Corriger un bug critique en prod | `main` | `main` + `develop` |

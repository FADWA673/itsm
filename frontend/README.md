# Frontend — ITSM Platform

Interface utilisateur construite avec React 19 et Vite. Permet la gestion des tickets, le suivi des incidents et l'accès aux fonctionnalités ITSM.

## Stack

| Outil | Version | Rôle |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Bundler / serveur de dev |
| TypeScript | 6 | Langage |
| React Router | 7 | Routage client |
| Axios | — | Appels API HTTP |

## Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Compiler pour la production
npm run build

# Prévisualiser le build de production
npm run preview

# Lancer le linter
npm run lint
```

## Scripts npm

| Script | Commande | Description |
|---|---|---|
| `dev` | `vite` | Serveur de développement (port 5173) |
| `build` | `tsc -b && vite build` | Compilation TypeScript + build Vite → `dist/` |
| `preview` | `vite preview` | Prévisualisation du build production |
| `lint` | `eslint .` | Vérification du code |

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs.

> Toutes les variables doivent être préfixées par `VITE_` pour être accessibles dans le code React.

| Variable | Valeur par défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL de l'API backend |
| `VITE_APP_NAME` | `ITSM Platform` | Nom de l'application |
| `VITE_ENABLE_AI` | `false` | Activer le module IA |
| `VITE_ENABLE_WHATSAPP` | `false` | Activer l'intégration WhatsApp |
| `VITE_ENABLE_NOTIFICATIONS` | `true` | Activer les notifications |

## Structure `src/`

```
src/
├── main.tsx          # Point d'entrée React
├── App.tsx           # Composant racine et routage
├── assets/           # Images, icônes, fonts
├── components/       # Composants UI réutilisables
├── features/         # Modules fonctionnels (tickets, users...)
├── hooks/            # Custom React hooks
├── layouts/          # Layouts de pages
├── pages/            # Vues associées aux routes
├── services/         # Appels API (axios)
├── store/            # État global
├── styles/           # CSS global
├── types/            # Types TypeScript partagés
└── utils/            # Fonctions utilitaires
```

## Accès en développement

- **Local** : http://localhost:5173
- **Via Docker** : http://localhost:5173

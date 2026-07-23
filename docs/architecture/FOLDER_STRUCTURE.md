# Project Folder Structure — Validation (ITSM-001-4)

## Structure finale validée

```
itsm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── tests/
│   └── prisma/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── tests/
│       ├── types/
│       └── utils/
├── database/
│   ├── migrations/
│   ├── schema/
│   ├── scripts/
│   └── seeders/
├── docs/
│   ├── api/
│   ├── architecture/
│   │   ├── BRANCHING.md
│   │   └── FOLDER_STRUCTURE.md
│   ├── diagrams/
│   └── guides/
├── docker/
│   ├── backend/
│   ├── database/
│   └── frontend/
├── scripts/
│   ├── setup.sh
│   ├── seed.sh
│   ├── backup.sh
│   └── deploy.sh
├── shared/
│   ├── types/
│   ├── constants/
│   └── README.md
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .editorconfig
├── .gitignore
├── .prettierrc
├── docker-compose.yml
└── README.md
```

## Conformité par tâche

| Tâche | Description | Statut |
|-------|-------------|--------|
| 1 | Backend folder structure | ✅ Complet |
| 2 | Frontend folder structure (+ tests/) | ✅ Complet |
| 3 | scripts/ avec setup, seed, backup, deploy | ✅ Complet |
| 4 | .github/ avec workflows, ISSUE_TEMPLATE, PR template | ✅ Complet |
| 5 | Fichiers de config racine (.gitignore, .editorconfig, .prettierrc) | ✅ Présents. ESLint géré par package (flat config) |
| 6 | docker-compose.yml (mysql + backend + frontend) | ✅ Fonctionnel |
| 7 | shared/ (types/, constants/) | ✅ Créé et documenté |
| 8 | Validation documentée dans docs/architecture/ | ✅ Ce fichier |

## Note ESLint
Le projet utilise le format flat config (`eslint.config.js`) par package — standard ESLint v9+.
Un `.eslintrc` racine n'est pas nécessaire et serait redondant.

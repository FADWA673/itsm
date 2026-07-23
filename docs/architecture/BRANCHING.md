# Git Branching Strategy

## Branching Model

This project follows a **Git Flow** branching model adapted for CI/CD.

```
main
│
├── develop
│   ├── feature/*
│   ├── bugfix/*
│   └── release/*
│
└── hotfix/*
```

### Branch roles

| Branch       | Role                                                                 |
|--------------|----------------------------------------------------------------------|
| `main`       | Production-ready code only. Every commit here is a deployable release. |
| `develop`    | Integration branch. All completed features merge here before release. |
| `feature/*`  | New features or enhancements. Created from `develop`, merged back into `develop`. |
| `bugfix/*`   | Bug fixes during development. Created from `develop`, merged back into `develop`. |
| `release/*`  | Release stabilization. Created from `develop`, merged into `main` and `develop`. |
| `hotfix/*`   | Urgent production fixes. Created from `main`, merged into `main` and `develop`. |

---

## Branch Naming Conventions

Format: `<type>/<ticket-or-description>`

| Type      | Format                          | Example                        |
|-----------|---------------------------------|--------------------------------|
| feature   | `feature/<ticket>-description`  | `feature/SCRUM-30-ticket-module` |
| bugfix    | `bugfix/<ticket>-description`   | `bugfix/SCRUM-45-login-error`  |
| release   | `release/v<major>.<minor>.<patch>` | `release/v1.0.0`            |
| hotfix    | `hotfix/<ticket>-description`   | `hotfix/SCRUM-99-critical-auth-bug` |

Rules:
- Always lowercase, words separated by hyphens.
- Include the ticket number when one exists.
- Keep descriptions short and meaningful.

---

## Feature Branch Workflow

```
develop
  │
  ├──► git checkout -b feature/SCRUM-XXX-description
  │         │
  │         │  (develop, commit, push)
  │         │
  │         └──► Pull Request → develop
  │                   │
  │                   ▼
  │             Code review (min. 1 reviewer)
  │             CI checks pass
  │                   │
  └──────────────── Merge ◄──────────────────────
```

Steps:
1. `git checkout develop && git pull origin develop`
2. `git checkout -b feature/SCRUM-XXX-description`
3. Develop and commit using [Conventional Commits](../CONVENTIONS.md)
4. `git push -u origin feature/SCRUM-XXX-description`
5. Open a Pull Request targeting `develop`
6. At least 1 reviewer must approve; CI must pass
7. Merge via PR (squash or merge commit)
8. Delete the feature branch after merge

---

## Release Branch Workflow

```
develop
  │
  ├──► git checkout -b release/vX.Y.Z
  │         │
  │         │  (minor fixes, version bump, changelog)
  │         │
  │         ├──► Pull Request → main
  │         │         (tag vX.Y.Z on main)
  │         │
  └─────────└──► Pull Request → develop
```

Steps:
1. `git checkout develop && git pull origin develop`
2. `git checkout -b release/vX.Y.Z`
3. Apply only minor fixes and version bump (no new features)
4. Open PR to `main` — merge and tag `vX.Y.Z`
5. Open PR to `develop` — keep develop up to date
6. Delete the release branch after both merges

---

## Hotfix Branch Workflow

```
main
  │
  ├──► git checkout -b hotfix/SCRUM-XXX-description
  │         │
  │         │  (fix the critical bug)
  │         │
  │         ├──► Pull Request → main
  │         │         (tag vX.Y.Z+1 on main)
  │         │
  └─────────└──► Pull Request → develop
```

Steps:
1. `git checkout main && git pull origin main`
2. `git checkout -b hotfix/SCRUM-XXX-description`
3. Fix the critical issue and commit
4. Open PR to `main` — merge and tag a patch version
5. Open PR to `develop` — keep develop up to date
6. Delete the hotfix branch after both merges

---

## Merge Rules and Review Requirements

| Rule                        | Detail                                              |
|-----------------------------|-----------------------------------------------------|
| Pull Request required       | Direct pushes to `main` and `develop` are forbidden |
| Minimum reviewers           | 1 reviewer required (2 recommended for `main`)      |
| CI checks                   | All checks must pass before merge is allowed        |
| Branch up to date           | Branch must be up to date with target before merge  |
| No force push               | Force pushes to `main` and `develop` are forbidden  |
| Delete branch after merge   | Feature/bugfix/release/hotfix branches are deleted after merge |

These rules are enforced via GitHub Branch Protection Rules on `main` and `develop`.

To configure on GitHub:
- Go to **Settings → Branches → Add rule**
- Target: `main` and `develop`
- Enable: "Require a pull request before merging", "Require approvals (1)", "Require status checks to pass"

---

## References

- [Conventions & Naming](../CONVENTIONS.md)
- [Git Flow original model](https://nvie.com/posts/a-successful-git-branching-model/)

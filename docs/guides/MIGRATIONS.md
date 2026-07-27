# Guide des Migrations — Prisma Migrate

## Workflow standard

### 1. Modifier le schéma
Éditer `backend/prisma/schema.prisma` — ajouter/modifier/supprimer des modèles ou champs.

### 2. Créer la migration (développement)
```bash
cd backend
npm run db:migrate
# Prisma demande un nom → utiliser le format : add_user_table, add_ticket_status_enum...
```

Prisma génère automatiquement :
- `backend/prisma/migrations/<timestamp>_<nom>/migration.sql`
- Met à jour `prisma/migrations/migration_lock.toml`

### 3. Commiter la migration
```bash
git add prisma/migrations/
git commit -m "feat(db): add <description> migration"
```

### 4. Appliquer en production
```bash
npm run db:migrate:deploy
# Applique toutes les migrations non encore exécutées
# Ne crée PAS de nouvelles migrations
```

---

## Conventions de nommage

| Type de changement | Format du nom | Exemple |
|---|---|---|
| Nouveau modèle | `add_<model>_table` | `add_ticket_table` |
| Nouveau champ | `add_<field>_to_<model>` | `add_phone_to_users` |
| Modifier un champ | `update_<field>_in_<model>` | `update_status_in_tickets` |
| Supprimer un champ | `remove_<field>_from_<model>` | `remove_legacy_field_from_users` |
| Nouvel index | `add_index_<model>_<field>` | `add_index_users_email` |
| Nouvel enum | `add_<enum>_enum` | `add_ticket_priority_enum` |

---

## Commandes disponibles

```bash
# Créer + appliquer une migration (dev)
npm run db:migrate

# Appliquer les migrations sans en créer (prod/staging)
npm run db:migrate:deploy

# Reset complet (⚠️ EFFACE toutes les données)
npm run db:migrate:reset

# Push schéma sans migration (prototype rapide)
npm run db:push

# Interface graphique Prisma Studio
npm run db:studio
```

---

## Stratégie de rollback

Prisma Migrate ne supporte pas le rollback automatique.
Stratégie recommandée :

1. **Dev** : `npm run db:migrate:reset` puis réappliquer
2. **Prod** : écrire une migration inverse manuelle
   ```bash
   npm run db:migrate
   # Nom : revert_<nom_migration_originale>
   ```

---

## Environnements

| Environnement | Commande | Notes |
|---|---|---|
| Development | `db:migrate` | Crée + applique |
| CI/CD | `db:migrate:deploy` | Applique uniquement |
| Production | `db:migrate:deploy` | Jamais `db:migrate` en prod |
| Test | `db:migrate:deploy` | Sur DB de test dédiée |

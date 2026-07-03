# Nuke My City — base de données

Persistance des joueurs et des frappes. **Aucun secret ici** (cf. `.env.local`, non committé).

## Où

Base **isolée** `nukemycity` sur le VPS Hetzner mutualisé (même infra que footballstat, cf. son `OPS.md`). Rôle dédié `nukemycity_user`, password dans `/opt/stack/.env` du VPS (`NUKEMYCITY_DB_PASSWORD`). Ne touche à aucune autre base.

- **Runtime** (`DATABASE_URL`) : pooler PgBouncer TLS `db.footballstat.fr:6432/nukemycity?sslmode=verify-full`
- **Migrations** (`DIRECT_URL`) : Postgres direct via tunnel SSH `ssh -N -L 5433:127.0.0.1:5432 b4d@<vps>`

## Schéma (Drizzle — `src/db/schema.ts`)

- `players` : id, pseudo (unique), email, faction, created_at
- `strikes` : id, player_id → players, lng, lat, weapon, seed, city, country, created_at

## Migrations

```bash
pnpm db:generate     # génère le SQL depuis le schéma
# ouvrir le tunnel SSH (garder ouvert), puis :
pnpm db:migrate      # applique via DIRECT_URL
```

> Le journal drizzle (`drizzle.__drizzle_migrations`) a été **baseliné** sur la migration 0000 (appliquée hors tunnel via `docker exec` au setup). Les migrations > 0000 s'appliquent normalement.

## API

- `GET /api/strikes?limit=500` → frappes récentes (avec pseudo) pour rejeu
- `POST /api/strikes` `{ pseudo, lng, lat, weapon, seed? }` → enregistre une frappe

## À faire

- [ ] Auth Better Auth (brancher `user.id` sur `players`)
- [ ] Géocodage différé lng/lat → city/country
- [ ] Vercel : `DATABASE_URL` en env de prod

# Running the site + CMS locally

Three processes, three terminals: Postgres (Docker), Strapi (`cms/`), Next.js (repo root).

## 1. Postgres

```bash
cd cms
docker compose -f docker-compose.dev.yml up -d
```

Dev Postgres listens on host port **5433** (not 5432 — remapped because a native
Windows `postgresql-x64-18` service was already holding 5432 on the dev machine).
Data persists in the `cms_strapi_postgres_data` Docker volume across `docker compose down`
(without `-v`), so content survives a restart.

## 2. Strapi

```bash
cd cms
npm run develop
```

Admin panel: http://localhost:1337/admin

`cms/.env` (gitignored) already holds the DB credentials and Strapi's app secrets
(`APP_KEYS`, `ADMIN_JWT_SECRET`, etc.) for this machine. As long as the Postgres volume
above hasn't been wiped, the admin user and both API tokens already exist in that DB —
nothing to recreate.

## 3. Next.js

```bash
bun run dev
```

Site: http://localhost:3000

Root `.env` (gitignored) needs:

```
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=<the nextjs-build-reader token>
```

The catch-all pages (e.g. `/services/erp/`) fetch from Strapi on first request per
process and cache in-memory (`src/libs/cms/getPages.js`'s `getAllPages()` memoization) —
this applies in both `bun run dev` and `bun run build`. The 4 bespoke pages (`/`,
`/about-us/`, `/contact/`, `/services/`) read from local JSON in `src/data/pages/*.json`
and never touch Strapi.

## Cold start / recovering from a wiped Postgres volume

If the `cms_strapi_postgres_data` volume is ever removed (e.g. `docker compose down -v`,
or a fresh clone on a new machine), there's no admin user or content left — rebuild from
scratch:

1. Bring up Postgres (step 1) and Strapi (step 2).
2. Open http://localhost:1337/admin and create a new admin user (first run only).
3. Settings → API Tokens → create two tokens:
   - `nextjs-build-reader` — Read-only, unlimited duration
   - `content-migration` — Full access, unlimited duration
4. Put the tokens in `.env` (root, `STRAPI_API_TOKEN`) and have the migration token ready
   for step 5 — it isn't stored anywhere, just passed inline.
5. Re-run the one-time migration to repopulate the 22 catch-all pages from
   `src/data/pages/*.json` into Strapi:

   ```bash
   STRAPI_URL=http://localhost:1337 STRAPI_MIGRATION_TOKEN=<content-migration token> bun scripts/cms-migrate/migrate.mjs
   ```

   Expected: `Found 22 catch-all page files to migrate.` ... `22 created, 0 failed`.
6. `bun run dev` / `bun run build` from the repo root as in step 3.

## Notes

- Strapi API tokens carry their own permission scope — they don't depend on the
  Public role's permissions (which default to zero). `nextjs-build-reader` only needs
  read access; `content-migration` is used solely by the migration script, never by the
  deployed app.
- Production deployment (a real VPS + Coolify + `cms.bbtech.ae`) is a separate, not-yet-
  started effort — see `docs/superpowers/plans/2026-10-07-headless-cms.md`, Part B
  (Tasks 17-23).

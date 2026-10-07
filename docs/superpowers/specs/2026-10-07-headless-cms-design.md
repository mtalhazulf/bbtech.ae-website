# Headless CMS + no-touch deploy pipeline

Date: 2026-10-07
Status: approved design, pending implementation plan

## Problem

All content on bbtech.ae lives in committed JSON (`src/data/pages/*.json`, `src/data/site.json`)
and is only ever changed by editing files in this repo and redeploying by hand — there is no
production deployment today at all (no CI, no docker-compose, nobody runs the existing
`Dockerfile` anywhere persistent). The client wants to be able to edit page copy without a
developer touching code, and wants the whole path from "edit content" or "push code" to "it's
live" to require zero manual steps.

## Goals

- A real CMS the client can log into and edit page content in.
- Editing content and publishing it updates the live site with no human action beyond clicking
  "Publish" in the CMS.
- Pushing code to `main` updates the live site with no human action beyond the push.
- Postgres as the CMS's database.
- The public site stays fully statically generated, as it is today — no new request-time
  dynamism beyond the existing `/api/contact` route.
- No new infrastructure or code beyond what this problem actually needs.

## Non-goals (explicitly out of scope for this design)

- `site.json`'s `facts`, footer, offices, forms config, and `next.config.js` redirects are
  **not** moving into the CMS. They stay code-managed JSON, same as today — this content is
  structural/compliance-sensitive (canonical facts, SMTP config, URL parity) and already has a
  locked editing workflow (see `AGENTS.md` "Canonical facts").
- No CMS-managed media library. Images stay in `public/images/bbtech/`, referenced by path, same
  as today. Revisit only if the client needs to upload their own images regularly.
- No ISR / on-demand revalidation. Every content change is a full static rebuild
  (~1-3 min, acceptable for a low-traffic marketing site with infrequent edits).
- No changes to the contact form/SMTP pipeline, the hidden (`_team`/`_careers`/etc.) routes, or
  any existing JS-only/static-output architecture rule in `AGENTS.md`.
- Not modeling forms inside the CMS — a CMS "form" section is just a reference to an existing
  `formId` in `forms.json`.

## CMS choice: Strapi, not Payload

Strapi, for one decisive reason: this repo's `AGENTS.md` hard-requires plain JavaScript, with
TypeScript migration explicitly deferred as its own future project. Payload is TypeScript-first
by design and convention (config, plugins, generated types); forcing it into a JS-only project
fights the tool. Strapi runs natively in JS, is a fully decoupled headless service with its own
admin UI, has first-class Postgres support, and ships built-in publish/update webhooks — exactly
the hook the rebuild pipeline needs, with no custom webhook-receiver code required.

## Architecture

One VPS running [Coolify](https://coolify.io) (self-hosted, open-source PaaS). Three Coolify-managed
resources, all from this one git repo:

```
                          ┌─────────────────────────┐
  git push main  ───────▶ │  Coolify (on one VPS)    │
                          │                          │
  Strapi "publish" ─────▶ │  deploy webhook URL      │
  webhook                 └─────────────┬────────────┘
                                         │ rebuild + zero-downtime swap
                     ┌───────────────────┼───────────────────┐
                     ▼                   ▼                   ▼
             ┌───────────────┐   ┌───────────────┐   ┌──────────────┐
             │ Postgres       │◀──│ Strapi (cms/)  │   │ Next.js app  │
             │ (Coolify-      │   │ cms.bbtech.ae  │   │ bbtech.ae    │
             │  managed)      │   │ Node, own      │   │ bun, existing│
             │                │   │ container      │   │ Dockerfile   │
             └───────────────┘   └───────┬────────┘   └──────┬───────┘
                                          │ internal Docker network only
                                          └──────────fetched at `next build` time───┘
```

- `cms/` is a new top-level folder in this repo: a Strapi project (own `package.json`, own
  `Dockerfile`, runs on Node — Strapi doesn't support bun, which is fine since it's an isolated
  container). Connects to the Coolify-managed Postgres instance.
- The root Next.js app's `Dockerfile` is unchanged in shape (`bun run build && bun run start`);
  it gains build ARGs for `STRAPI_URL` / `STRAPI_API_TOKEN`, following the existing pattern
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` already uses for a build-time-only value.
- Strapi's admin UI gets its own subdomain (e.g. `cms.bbtech.ae`) via Coolify's reverse proxy,
  for the client to log in and edit content. The Next.js build reaches Strapi over Coolify's
  internal Docker network during the build step, not over the public internet — the CMS API
  itself does not need to be publicly reachable.
- Two independent deploy triggers, same underlying mechanism (rebuild + swap the Next.js
  container):
  1. `git push` to `main` → Coolify's standard git-based auto-deploy. No custom CI code.
  2. Strapi's built-in "entry published/updated" webhook → configured to call the Next.js app's
     Coolify deploy webhook URL.
- Strapi's own schema migrations run automatically on container boot when content-type schemas
  change — no custom Postgres migration tooling needed.
- Coolify only swaps a container on a *successful* build, so a Strapi outage or bad data at
  build time fails the build loudly (same as any other build error) and the previously-live
  site keeps serving — it can never take the site down.

## Content model (Strapi side)

A `Page` collection type mirroring the existing JSON shape in `src/data/pages/*.json`:

- `slug`, `path` — same meaning as today's fields.
- `metadata` component — `title`, `description`, `canonical`; `ogImage` stays a repo-relative
  path **string** (not a CMS media field, per the no-media-library non-goal above).
- `hero` component — same shape as today's `hero` key.
- `sections` — a Strapi **dynamic zone**, with one component per existing section type:
  `richText`, `cardGrid`, `checklist`, `cta`, `form`. This is a 1:1 match for the existing
  `sections: [{ type, ... }]` ordered array that `SectionRenderer` (`src/components/sections/dynamic/`)
  already expects — no change to how sections render, only to where their data comes from.
- The `form` component holds only a `formId` string referencing `forms.json` — forms stay
  code-managed, not modeled in the CMS (non-goal above).

### One-time content migration

A new `scripts/cms-migrate/*.mjs` (bun script, same pattern as the existing
`scripts/import/*.mjs` tooling) reads every current `src/data/pages/*.json` and creates the
matching Strapi entries via its REST API, so none of the already-migrated content needs to be
re-typed by hand. This runs once during cutover, not on every build.

## Build-time integration (Next.js side)

`src/data/pages/index.js`'s static JSON-registry-by-import is replaced by a build-time fetch
from Strapi's API, in a new `src/libs/cms/getPages.js`. This still executes entirely during
`next build` — Server Components already run at build time to produce static output — so the
*deployed* site makes zero request-time calls to Strapi. "Static output, no request-time data"
(`AGENTS.md`) holds exactly as it does today; the only thing that changed is where build-time
data comes from.

Error handling: if Strapi is unreachable, or returns data that doesn't match the expected shape,
the build throws and fails — consistent with this repo's existing stance (`AGENTS.md`: "Never
fabricate content to fill a template slot. Leave the slot empty or hide the section, and tell
the user") and with Coolify's fail-safe swap behavior above.

## Explicitly unchanged

`site.json` (facts, footer, offices, forms, socials), `src/libs/resolveFacts.js`, the redirects in
`next.config.js`, the contact form/SMTP pipeline (`src/app/api/contact/route.js` and everything
under `src/libs/forms/` and `src/libs/mail/`), and the hidden (`_team`, `_careers`, `_history`,
etc.) private routes — none of this moves into Strapi.

`scripts/import/verify.mjs` needs updating to validate CMS-sourced content instead of static
JSON imports (same invariants — route coverage, text-leaf coverage, zero template residue —
just reading from the new source), but that is implementation detail for the plan, not a design
fork.

## Open prerequisite

This needs an actual VPS to install Coolify on (e.g. Hetzner, DigitalOcean) if one doesn't
already exist. Provisioning that VPS is outside what this design or its implementation plan can
do automatically — it's a one-time manual step before the pipeline described here can run for
real.

## Rejected alternatives

- **Payload CMS**, mounted inside the existing Next.js app: fewer services, but Payload's
  idiomatic path is a TypeScript config, which conflicts with this repo's plain-JavaScript-only
  rule, and it would permanently add dynamic admin/API routes inside an app whose architecture
  is otherwise fully static.
- **Strapi + Postgres, but hand-rolled docker-compose + GitHub Actions instead of Coolify**: same
  CMS, but we'd write and maintain the deploy pipeline ourselves — build/push/SSH-deploy workflow,
  a custom webhook receiver, zero-downtime swap logic — all of which Coolify already provides.
  More control, meaningfully more code to own, which cuts against "no over-engineering."

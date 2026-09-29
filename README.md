# bbtech.ae website

Rebuild of [bbtech.ae](https://bbtech.ae) (WordPress + The7 theme) on Next.js, carrying
over the live site's real content and re-themed to the BB Tech brand.

**Read these before making changes:**

- [`AGENTS.md`](AGENTS.md) — the canonical project reference: stack, architecture,
  content-import system, routing/SEO decisions, forms, conventions, and open decisions.
- [`DESIGN.md`](DESIGN.md) — the design system: every color/typography/spacing token,
  contrast rules, and the accessibility checklist.
- [`CLAUDE.md`](CLAUDE.md) — Claude Code-specific workflow notes (skip if you're not
  using Claude Code).
- `content-import/` — the content migration's working record: what was imported, known
  content conflicts, client asks, and per-phase launch reports under `content-import/launch/`.

## Stack

Next.js 16 (App Router, Turbopack), React 19, plain JavaScript (no TypeScript), SCSS on
Bootstrap 5, GSAP/Swiper/WOW.js for motion, `bun` as the package manager and runtime.
No database — every real page is statically prerendered; the only server code is one
Route Handler (`src/app/api/contact/route.js`) that sends form submissions over SMTP.

## Getting started

```bash
bun install --frozen-lockfile   # never use npm/yarn/pnpm — keep bun.lock authoritative
cp .env.example .env            # see "Environment variables" below
bun run dev                     # http://localhost:3000
```

## Commands

```bash
bun run dev      # dev server (Turbopack)
bun run build    # production build — the only automated correctness gate; must pass
bun run start    # serve the production build
bun run test     # vitest — forms/email validation and rendering
```

After any content or rendering change, also run the content-import verifier against a
production build:

```bash
bun run build && bun scripts/import/verify.mjs
```

There is no linter, formatter, or type-checker configured.

## Environment variables

Copy `.env.example` to `.env` and fill in real values before forms will send mail. All
of it is optional for `bun run dev`/`bun run build` — pages still render, and the contact
form fails closed (returns an error, sends nothing) until these are set:

| Variable | Purpose |
|---|---|
| `SITE_URL` | Canonical origin, used in email links and JSON-LD. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Outbound mailbox for form emails. |
| `MAIL_FROM`, `MAIL_TO`, `MAIL_BCC` | Sender/recipient(s) for the team notification. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (form spam protection). The site key is inlined at **build** time (see the Dockerfile), the secret is runtime-only. |

## Deployment

```bash
docker build -t bbtech-web --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY=<key> .
docker run -p 3000:3000 --env-file .env bbtech-web
```

The image runs `bun run build` at build time and `next start` at runtime. Every other
env var (SMTP, the Turnstile secret) is runtime-only and must come from the container's
environment, never baked into the image.

## Project structure

See `AGENTS.md`'s "Repository map" section for the full breakdown. Short version: pages
live in `src/app/`, their copy lives in `src/data/` (edit the JSON, not the JSX), and
`src/app/assets/sass/` holds the design tokens (`utilities/_colors.scss` etc.) plus every
component's styles.

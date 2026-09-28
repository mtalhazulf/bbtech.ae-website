@AGENTS.md

<!-- AGENTS.md is the shared source of truth for every coding agent. Keep project facts there.
     This file holds only Claude Code-specific workflow. DESIGN.md is intentionally not imported
     (it's long); Claude reads it on demand when UI work starts. -->

# Claude Code notes

## Before you start

- **Any UI work** (SCSS, component markup and classes, images, colors, spacing, motion):
  read `DESIGN.md` first. It maps every template token to its BB Tech value and lists which
  color pairs are allowed.
- **Migrating a page:** fetch the live page with WebFetch (e.g. `https://bbtech.ae/services/web-development/`)
  and work from what comes back. The sandbox shell usually can't reach external sites, so don't curl.
  WebFetch can't see images, so ask the user for logo, photo, or badge files instead of guessing.
- Multi-file restyles or route changes (touching more than ~3 files, e.g. the slug migration or a
  token swap): use plan mode first and show the plan.

## Working efficiently here

- There are 106 SCSS partials. To find where a class or token is styled, use Grep
  (`grep -rn "h10-service" src/app/assets/sass`), or an Explore subagent for broad sweeps like
  "every hardcoded rgba(30, 138, 138, …)". Don't read partials one by one.
- To trace section → data, open the component, find its `@/data/...` import or `get*` call,
  and edit that JSON.
- To check a page visually, run `bun run dev` in the background, then check the route in a browser
  or with `/run`. Kill the dev server when you're done.

## Verification (always, before saying a task is done)

1. `bun run build`. It must pass. The `baseline-browser-mapping` "data is over two months old"
   notice is pre-existing noise; anything else new is a failure.
2. For styling changes, grep that you didn't reintroduce raw colors:
   `grep -rnE "#[0-9a-fA-F]{6}|rgba\(" <files you touched>`. Only token definitions in
   `utilities/_colors.scss` may contain literals.
3. Report what you verified and what you couldn't (e.g. "didn't check mobile Safari").

## Guardrails

- Don't commit, push, or create branches unless asked.
- Never fabricate content to fill a template slot. Leave the slot empty or hide the section, and tell the user.
- If the live site and this repo disagree on a fact, ask. Don't choose.
- Keep this file and `AGENTS.md` under ~200 lines each. Put new durable project facts in
  `AGENTS.md`, and new visual rules in `DESIGN.md`.

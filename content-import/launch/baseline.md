# Launch-completion baseline (Phase 0)

Captured on branch `feat/launch-complete`, from `main` @ `15e76f6`, before any Phase 1+ changes.
Fresh `bun install --frozen-lockfile` + `rm -rf .next && bun run build` (production build), served
with `bun run start` on `:3000`.

## Build

`bun run build`: passes, no new warnings (only the pre-existing `baseline-browser-mapping`
"data is over two months old" notice).

## Content coverage (`scripts/import/verify.mjs`, against the production build)

| Check | Result |
|---|---|
| Route coverage | 26/26 real pages built |
| JSON text-leaf coverage | **815/815** strings found |
| Image coverage | **64/64** manifest assets found |
| Remote references + template residue | 0 issues |
| Internal link crawl | 0 broken links |
| Failures | **0** |

This is the number every later phase must still match (content parity is a hard blocker per
Phase 0 of the launch-completion brief).

## Screenshots

`content-import/screenshots/before/` (gitignored), full-page PNGs at 1440×900 and 390×844
(mobile), for: `/`, `/about-us/`, `/services/`, `/services/erp/` (service detail), `/erp/`,
`/contact/`. `services-390.png` is a viewport-only capture (the full-page capture timed out on
that page's length); everything else is full-page.

Note: this Chrome profile had stale per-origin state from earlier sessions that made `/services/`,
`/erp/`, and `/contact/` fail with `ERR_TOO_MANY_REDIRECTS` in the default browser context, even
though `curl` confirmed the server returns a clean `200` with no redirect for all three (no
service worker or cache was registered on the working tabs either). Worked around by loading
those three in an isolated browser context (`isolatedContext: "baseline-test"`); not a site bug.

## Lighthouse (accessibility, best practices, SEO) — `lighthouse_audit`

The available Lighthouse tool in this environment excludes the Performance category (see the
Core Web Vitals section below for lab performance data instead).

| Page | Device | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | mobile | 86 | 100 | 100 |
| `/` | desktop | 91 | 100 | 100 |
| `/services/erp/` | mobile | 86 | 100 | 92 |
| `/services/erp/` | desktop | 91 | 100 | 92 |
| `/contact/` | mobile | 86 | 100 | 92 |
| `/contact/` | desktop | 91 | 100 | 92 |

Target for Phase 6/7: Accessibility ≥ 95 everywhere (currently 86–91); SEO = 100 on mobile
(currently 92 on inner pages); Best Practices already at 100.
Full JSON/HTML reports are alongside each row in `content-import/screenshots/before/lighthouse/`.

The SEO gap is a missing `<meta name="description">` — the live site had no Yoast description
for that page at import time, so `metadata.description` is `null`. **10 of 26 pages** are
affected: `adhics-medical-inspection-consultancy`, `branding-rebranding`,
`cloud-computing-services`, `contact`, `healthcare-and-medical-centre-software-services`,
`it-outsourcing-2`, `network-solutions`, `privacy-policy`, `services/erp`, `video-photography`.
Phase 7 fixes this by deriving each one from that page's own first real paragraph (a summary of
existing copy, not new content), capped to ~155–160 characters.

## Core Web Vitals (lab, via a raw performance trace — `performance_start_trace`)

Mobile trace = 4x CPU throttle + Slow 4G network (Lighthouse's mobile preset). Desktop trace =
no throttling.

| Page | Device | LCP | CLS |
|---|---|---|---|
| `/` | mobile | 1624 ms | 0.00 |
| `/` | desktop | 251 ms | 0.00 |
| `/services/erp/` | mobile | 1655 ms | 0.00 |
| `/contact/` | mobile | 1876 ms | 0.00 |

All three mobile LCPs are already under the 2.5s target and CLS is 0.00 everywhere, so Phase 7's
CWV targets are already met at baseline — re-theming (new fonts/CSS) must not regress them.

One real finding surfaced during tracing that maps straight to `DESIGN.md` §4's font-trimming
plan: the **FontDisplay** insight on `/` estimates **3000ms of potential FCP savings** from
setting `font-display: swap`/`optional` — Mona Sans is currently loaded twice (200–900 weights +
italics) with no swap behavior. Phase 2/Phase 7 should fix this together.

## Dependency state (context for Phase 1)

`bun install --frozen-lockfile` reinstalled 35 packages cleanly; `bun.lock` untouched. GitHub
flags 1 critical Dependabot alert on `main` (swiper, prototype pollution) — see Phase 1.
